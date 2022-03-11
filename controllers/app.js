const HTTPStatus = require('http-status-codes')
const config = require('../config')
const log = require('../util/logger')
const { roles } = require('../util/enums')
const { Op } = require('sequelize')
const { models, sequelize } = require('../models')
const Gateway = require('../services/gateway')
const { NoGatewayError } = require('../services/gateway/errors')
const { publishEvent, routingKeys } = require('../services/msg-broker')
const {
  settingTypes,
  subscriptionModels,
  appStates,
  appTypes,
} = require('../util/enums')
const Idp = require('../services/idp')
const publicAppsController = require('./app.public')
const appMediaController = require('./app.media')

const appAttributes = {
  include: [
    ['redirect_url', 'redirectUrl'],
    ['org_id', 'orgId'],
  ],
  exclude: [
    'client_data',
    'enable',
    'appTypeId',
    'app_type_id',
  ],
}

const includes = () => [
  {
    model: models.Api,
    as: 'subscriptions',
    through: { attributes: [] },
  },
  {
    model: models.AppMetadata,
    as: 'metadata',
    attributes: ['key', 'value', 'title', 'description'],
  },
  {
    model: models.AppType,
    attributes: ['id', 'type', 'createdAt', 'updatedAt'],
  },
]

const getSubscriptionModel = async () => {
  const planSettings = await models.Setting.findOne({
    where: { type: settingTypes.PLAN },
  })
  if (!planSettings || !planSettings.values) throw new Error('Plan settings missing.')
  return planSettings.values.subscriptionModel || subscriptionModels.SIMPLIFIED
}

const handleGatewaySubscriptions = async (app, currentSubs, newSubs) => {
  let gateway
  try {
    gateway = await Gateway()
  } catch (error) {
    if (error instanceof NoGatewayError) {
      return
    }
    log.error('[handleGatewaySubscriptions] => getGateway', error)
  }

  const subsToDelete = currentSubs
    .filter((cs) => !newSubs.includes(cs.id))
    .map((sub) => sub.id)

  try {
    await gateway.unsubscribeAPIs(app.id, subsToDelete)
  } catch (error) {
    log.error('[handleGatewaySubscriptions] => unsubscribeFromAPI', error)
  }

  try {
    await gateway.subscribeAPIs(app.id, app.clientId, newSubs)
  } catch (error) {
    log.error('[handleGatewaySubscriptions] => subscribeAPIs', error)
  }
}

const listApps = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  let apps = await models.App.findAll({
    where: {
      org_id: orgId,
      enable: true,
    },
    attributes: appAttributes,
    include: includes(),
  })

  const subscriptionModel = await getSubscriptionModel()
  if (subscriptionModel === subscriptionModels.SIMPLIFIED) {
    const apis = await models.Api.findAll({
      where: {
        publishedAt: { [Op.not]: null },
      },
      distinct: true,
      include: [{ model: models.ApiVersion }],
    })

    const apiIDs = apis.map((s) => s.id)

    apps = apps.map((app) => {
      app = app.get({ plain: true })
      app.subscriptions = app.state === appStates.APPROVED ? apiIDs : []
      return app
    })
  }

  if (req.params.id) {
    publishEvent(routingKeys.ORG_APPS_LISTED, {
      user_id: req.user.id,
      organization_id: req.params.id,
    })
  }

  return res.status(HTTPStatus.OK).send(apps)
}

const getApp = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  let app = await models.App.findOne({
    where: {
      id: req.params.appId,
      org_id: orgId,
      enable: true,
    },
    attributes: appAttributes,
    include: includes(),
  })

  if (!app) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })
  }

  app = app.get({ plain: true })

  const subscriptionModel = await getSubscriptionModel()
  if (app.state === appStates.APPROVED && subscriptionModel === subscriptionModels.SIMPLIFIED) {
    const apis = await models.Api.findAll({
      where: {
        publishedAt: { [Op.not]: null },
      },
      distinct: true,
      include: [{ model: models.ApiVersion }],
    })

    app.subscriptions = apis.map((s) => s.id)
  }

  if (app.state !== appStates.APPROVED) {
    app.subscriptions = []
  }

  if (req.params.id) {
    publishEvent(routingKeys.ORG_APPS_READ, {
      user_id: req.user.id,
      app_id: req.params.appId,
      organization_id: req.params.id,
    })
  }

  return res.status(HTTPStatus.OK).send(app)
}

const deleteApp = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  const transaction = await sequelize.transaction()
  try {
    const [rowsUpdated, [updated]] = await models.App.update(
      {
        enable: false,
        clientSecret: null,
      },
      {
        returning: true,
        where: {
          id: req.params.appId,
          org_id: orgId,
        },
        transaction,
      },
    )

    if (!rowsUpdated) {
      await transaction.commit()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: 'App not found' })
    }

    if (updated.clientId) {
      const idp = await Idp.getIdP()
      await idp.deleteClient(updated.clientId, updated.client_data)

      try {
        const gateway = await Gateway()
        await gateway.removeApp(updated.id)
      } catch (error) {
        log.error('[deleteApp] => removeApp', error)
        if (!(error instanceof NoGatewayError)) {
          if (transaction) await transaction.rollback()
        }
      }
    }

    await transaction.commit()

    publishEvent(routingKeys.APP_DELETED, {
      user_id: req.user.id,
      app_id: req.params.appId,
      organization_id: orgId,
    })

    if (req.params.id) {
      publishEvent(routingKeys.ORG_APPS_DELETED, {
        user_id: req.user.id,
        app_id: req.params.appId,
        organization_id: req.params.id,
      })
    }

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[DELETE APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ success: false, errors: ['Failed to delete app.'] })
  }
}

const updateApp = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  const transaction = await sequelize.transaction()
  try {
    if (req.user.role.name !== roles.ADMIN) req.body.labels = undefined

    let appTypeId
    if (req.body.appTypeId) {
      const appType = await models.AppType.findByPk(req.body.appTypeId)
      if (!appType) {
        return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Failed to create app. App type does not exists'] })
      }
      appTypeId = appType.id
    }

    const [rowsUpdated, [updated]] = await models.App.update(
      {
        name: req.body.name,
        description: req.body.description,
        shortDescription: req.body.shortDescription,
        redirect_url: req.body.redirectUrl,
        logo: req.body.logo,
        visibility: req.body.visibility,
        labels: req.body.labels,
        tosUrl: req.body.tosUrl,
        privacyUrl: req.body.privacyUrl,
        youtubeUrl: req.body.youtubeUrl,
        websiteUrl: req.body.websiteUrl,
        supportUrl: req.body.supportUrl,
        directUrl: req.body.directUrl,
        appTypeId: appTypeId,
      },
      {
        transaction,
        returning: true,
        include: [
          ...includes(),
        ],
        where: {
          id: req.params.appId,
          org_id: orgId,
          enable: true,
        },
        attributes: appAttributes,
      },
    )

    if (!rowsUpdated) {
      await transaction.commit()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: 'App not found' })
    }

    if (req.body.metadata) {
      await models.AppMetadata.destroy({
        where: { appId: updated.id },
      }, { transaction })

      const metadata = req.body.metadata.map((m) => ({
        ...m,
        appId: updated.id,
      }))

      await models.AppMetadata.bulkCreate(metadata, { transaction })
    }

    const subscriptionModel = await getSubscriptionModel()

    if (subscriptionModel === subscriptionModels.DETAILED && typeof req.body.subscriptions !== 'undefined') {
      const subscriptions = req.body.subscriptions || []
      let currSubs = await updated.getSubscriptions({ transaction })
      currSubs = currSubs.length ? currSubs.map(s => s.id) : []
      await updated.removeSubscriptions(currSubs, { transaction })
      await updated.addSubscriptions(subscriptions, { transaction })

      try {
        await handleGatewaySubscriptions(updated, currSubs, subscriptions)
      } catch (err) {
        if (transaction) await transaction.rollback()
        log.error(err, '[SUBSCRIBE TO API IN GATEWAY]')
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to subscribe api.'] })
      }
    }

    await transaction.commit()

    const appEventMeta = {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      shortDescription: updated.shortDescription,
      logo: updated.logo,
      visibility: updated.visibility,
      state: updated.state,
      labels: updated.labels,
      org: req.user.organizations.find((o) => o.id === Number(orgId)),
    }

    publishEvent(routingKeys.APP_UPDATED, {
      user_id: req.user.id,
      app_id: req.params.appId,
      organization_id: orgId,
      app_type_id: updated.app_type_id,
      meta: appEventMeta,
    })

    if (req.params.id) {
      publishEvent(routingKeys.ORG_APPS_UPDATED, {
        user_id: req.user.id,
        app_id: req.params.appId,
        organization_id: req.params.id,
        meta: appEventMeta,
      })
    }

    const app = await models.App.findByPk(updated.id, {
      attributes: appAttributes,
      include: includes(),
    })

    return res.status(HTTPStatus.OK).send(app)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[UPDATE APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update the app'] })
  }
}

const createDraftApp = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  const transaction = await sequelize.transaction()
  try {
    const idp = await Idp.getIdP()

    if (req.user.role.name !== roles.ADMIN) req.body.labels = []

    let appType
    if (req.body.appTypeId) {
      appType = await models.AppType.findByPk(req.body.appTypeId)
    } else {
      appType = await models.AppType.findOne({
        where: { type: appTypes.CLIENT_APP },
      })
    }

    if (!appType) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Failed to create app. App type does not exists'] })
    }

    let app = await models.App.create({
      name: req.body.name,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      redirect_url: req.body.redirectUrl,
      logo: req.body.logo,
      enable: true,
      org_id: orgId,
      idpProvider: idp.getProvider(),
      state: appStates.DRAFT,
      visibility: req.body.visibility,
      labels: req.body.labels || [],
      images: [],
      tosUrl: req.body.tosUrl,
      privacyUrl: req.body.privacyUrl,
      youtubeUrl: req.body.youtubeUrl,
      websiteUrl: req.body.websiteUrl,
      supportUrl: req.body.supportUrl,
      directUrl: req.body.directUrl,
      appTypeId: appType.id,
    }, { transaction })

    if (req.body.metadata && req.body.metadata.length) {
      const metadata = req.body.metadata.map((m) => ({
        ...m,
        appId: app.id,
      }))

      await models.AppMetadata.bulkCreate(metadata, { transaction })
    }

    app = await models.App.findByPk(app.id, {
      attributes: appAttributes,
      include: includes(),
      transaction,
    })

    await transaction.commit()

    const appEventMeta = {
      id: app.id,
      name: app.name,
      description: app.description,
      shortDescription: app.shortDescription,
      logo: app.logo,
      visibility: app.visibility,
      state: app.state,
      labels: app.labels,
      org: req.user.organizations.find((o) => o.id === Number(orgId)),
    }

    publishEvent(routingKeys.APP_CREATED, {
      user_id: req.user.id,
      app_id: app.id,
      organization_id: orgId,
      app_type_id: app.appType.id,
      meta: appEventMeta,
    })

    if (req.params.id) {
      publishEvent(routingKeys.ORG_APPS_CREATED, {
        user_id: req.user.id,
        app_id: req.params.appId,
        organization_id: req.params.id,
        meta: appEventMeta,
      })
    }

    return res.status(HTTPStatus.CREATED).send(app)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[CREATE DRAFT APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ success: false, errors: ['Failed to create app.'] })
  }
}

const requestAccess = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  const app = await models.App.findOne({
    where: {
      id: req.params.appId,
      org_id: orgId,
      enable: true,
    },
  })

  if (!app) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })
  }

  if (app.state === appStates.APPROVED) {
    return res.sendStatus(HTTPStatus.NO_CONTENT)
  }

  const subscriptionModel = await getSubscriptionModel()
  switch (subscriptionModel) {
    case subscriptionModels.SIMPLIFIED: {
      app.state = appStates.APPROVED

      if (config.get('selfRegisterAppOauthClients')) {
        const idp = await Idp.getIdP()
        const client = await idp.createClient({
          clientName: app.name,
          redirectURIs: [app.redirect_url],
        })

        app.clientId = client.clientId
        app.clientSecret = client.clientSecret
        app.client_data = client.extra
        app.idpProvider = idp.getProvider()

        let gateway
        try {
          gateway = await Gateway()
        } catch (error) {
          log.error('[requestAccess] => getGateway', error)
          if (!(error instanceof NoGatewayError)) {
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['gateway communication issue'] })
          }
        }
        if (gateway) await gateway.subscribeAll(app.id, app.clientId)
      }

      await app.save()
      break
    }
    case subscriptionModels.DETAILED: {
      app.state = appStates.PENDING
      await app.save()
      break
    }
  }

  publishEvent(routingKeys.APP_REQUESTED, {
    user_id: req.user.id,
    app_id: req.params.appId,
    organization_id: orgId,
    meta: {
      id: app.id,
      name: app.name,
      description: app.description,
      shortDescription: app.shortDescription,
      logo: app.logo,
      visibility: app.visibility,
      state: app.state,
      labels: app.labels,
      org: req.user.organizations.find((o) => o.id === Number(orgId)),
    },
  })

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

const subscribeToAPI = async (req, res) => {
  const orgId = req.params.id || req.user.org.id
  const subscriptionModel = await getSubscriptionModel()
  if (subscriptionModel === subscriptionModels.SIMPLIFIED) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Current subscription model does not allow to manage subscriptions.'] })
  }

  const transaction = await sequelize.transaction()
  try {
    const subscriptions = req.body.subscriptions || []
    let app = await models.App.findOne({
      where: {
        id: req.params.appId,
        org_id: orgId,
      },
      transaction,
    })

    if (!app) {
      await transaction.commit()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found.'] })
    }

    const apiCount = await models.Api.count({
      where: {
        id: subscriptions,
      },
    }, { transaction })

    if (apiCount !== subscriptions.length) {
      await transaction.commit()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['One or more APIs where not found.'] })
    }

    // unsubscribe all and add subscriptions again
    const currSubs = await app.getSubscriptions({ transaction })
    const subs = currSubs.length ? currSubs.map(s => s.id) : []
    await app.removeSubscriptions(subs, { transaction })
    await app.addSubscriptions(subscriptions, { transaction })

    app = await models.App.findOne({
      where: {
        id: req.params.appId,
      },
      include: includes(),
      transaction,
    })

    try {
      await handleGatewaySubscriptions(app, currSubs, subscriptions)
    } catch (err) {
      if (transaction) await transaction.rollback()
      log.error(err, '[SUBSCRIBE TO API IN GATEWAY]')
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to subscribe api.'] })
    }

    await transaction.commit()

    return res.status(HTTPStatus.OK).send(app)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[SUBSCRIBE TO API]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to subscribe api.'] })
  }
}

const isSubscribedTo = async (req, res) => {
  try {
    if (!res.locals.loggedInApp) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['App is not subscribed to an API.'] })
    }

    const route = req.body.path.split('?')[0] // clean any query params from path

    const app = await models.App.findOne({
      where: {
        clientId: res.locals.loggedInApp.clientId,
      },
      include: [{
        model: models.Api,
        as: 'subscriptions',
        include: [{
          model: models.ApiVersion,
          as: 'versions',
          include: [{
            model: models.ApiVersionRoute,
            as: 'routes',
            where: sequelize.literal('\'' + route + '\' ~ route'),
          }],
        }],
      },
      ],
    })

    if (!app) {
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found.'] })
    }

    if (!app.subscriptions || !app.subscriptions.length) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['App is not subscribed to the API.'] })
    }

    return res.status(HTTPStatus.OK).json({
      success: true,
      message: `App is subscribed to API for route ${req.body.path}`,
    })
  } catch (err) {
    log.error(err, '[IS SUBSCRIBED TO]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to get apps subscriptions.'] })
  }
}

const patchApp = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const [rowsUpdated, [updated]] = await models.App.update(
      req.body,
      {
        transaction,
        returning: true,
        include: [
          ...includes(),
        ],
        where: {
          id: req.params.appId,
          org_id: req.params.id,
          enable: true,
        },
        attributes: appAttributes,
      },
    )

    if (!rowsUpdated) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: 'App not found' })
    }

    if (req.body.metadata) {
      await models.AppMetadata.destroy({
        where: { appId: updated.id },
      }, { transaction })

      const metadata = req.body.metadata.map((m) => ({
        ...m,
        appId: updated.id,
      }))

      await models.AppMetadata.bulkCreate(metadata, { transaction })
    }

    await transaction.commit()

    const app = await models.App.findOne({
      where: { id: req.params.appId },
      attributes: appAttributes,
      include: includes(),
    })

    const appEventMeta = {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      shortDescription: updated.shortDescription,
      logo: updated.logo,
      visibility: updated.visibility,
      state: updated.state,
      labels: app.labels,
    }

    publishEvent(routingKeys.APP_UPDATED, {
      user_id: req.user.id,
      app_id: req.params.appId,
      organization_id: req.params.id,
      meta: appEventMeta,
    })

    if (req.params.id) {
      publishEvent(routingKeys.ORG_APPS_UPDATED, {
        user_id: req.user.id,
        app_id: req.params.appId,
        organization_id: req.params.id,
        meta: appEventMeta,
      })
    }

    return res.status(HTTPStatus.OK).send(app)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[UPDATE APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update the app'] })
  }
}

module.exports = {
  getApp,
  createDraftApp,
  requestAccess,
  updateApp,
  deleteApp,
  subscribeToAPI,
  listApps,
  isSubscribedTo,
  patchApp,
  ...publicAppsController,
  ...appMediaController,
}
