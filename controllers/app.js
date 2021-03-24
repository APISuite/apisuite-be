const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const { Op } = require('sequelize')
const { models, sequelize } = require('../models')
const Gateway = require('../services/gateway')
const { publishEvent, routingKeys } = require('../services/msg-broker')
const { settingTypes, subscriptionModels, appStates } = require('../util/enums')
const Idp = require('../services/idp')

const appAttributes = {
  include: [
    ['redirect_url', 'redirectUrl'],
    ['org_id', 'orgId'],
  ],
  exclude: [
    'client_data',
    'enable',
  ],
}

const includes = () => [
  {
    model: models.PubURLApp,
    as: 'pub_urls',
  },
  {
    model: models.Api,
    as: 'subscriptions',
    through: { attributes: [] },
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
  const gateway = await Gateway()

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
  try {
    let apps = await models.App.findAll({
      where: {
        org_id: req.user.org.id,
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

    return res.status(HTTPStatus.OK).send(apps)
  } catch (err) {
    log.error(err, '[LIST APPS]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to list apps.'] })
  }
}

const getApp = async (req, res) => {
  try {
    let app = await models.App.findOne({
      where: {
        id: req.params.id,
        org_id: req.user.org.id,
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

    return res.status(HTTPStatus.OK).send(app)
  } catch (err) {
    log.error(err, '[GET APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to get app.'] })
  }
}

const deleteApp = async (req, res) => {
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
          id: req.params.id,
          org_id: req.user.org.id,
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
        if (transaction) await transaction.rollback()
        log.error('[deleteApp] => removeApp', error)
      }
    }

    await transaction.commit()

    publishEvent(routingKeys.APP_DELETED, {
      user_id: req.user.id,
      app_id: req.params.id,
      organization_id: req.user.org.id,
    })

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[DELETE APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ success: false, errors: ['Failed to delete app.'] })
  }
}

const updateApp = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const [rowsUpdated, [updated]] = await models.App.update(
      {
        name: req.body.name,
        description: req.body.description,
        shortDescription: req.body.shortDescription,
        redirect_url: req.body.redirectUrl || req.body.redirect_url,
        logo: req.body.logo,
        labels: req.body.labels,
        tosUrl: req.body.tosUrl,
        privacyUrl: req.body.privacyUrl,
        youtubeUrl: req.body.youtubeUrl,
        websiteUrl: req.body.websiteUrl,
        supportUrl: req.body.supportUrl,
      },
      {
        transaction,
        returning: true,
        include: [
          ...includes(),
        ],
        where: {
          id: req.params.id,
          org_id: req.user.org.id,
          enable: true, // prevent updates to disabled apps
        },
        attributes: appAttributes,
      },
    )

    if (!rowsUpdated) {
      await transaction.commit()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: 'App not found' })
    }

    if (typeof req.body.pub_urls !== 'undefined') {
      const data = []
      for (const pubUrl of req.body.pub_urls) {
        const puburlData = {
          url: pubUrl.url,
          app_id: updated.dataValues.id,
          type: pubUrl.type,
        }
        if (pubUrl.id) {
          puburlData.id = pubUrl.id
        }
        data.push(puburlData)
      }

      // find urls to remove
      const removeUrls = await models.PubURLApp.findAll({
        where: {
          [Op.and]: [{
            app_id: updated.dataValues.id,
          }, {
            id: { [Op.notIn]: req.body.pub_urls.map(u => u.id) },
          }],
        },
      }, { transaction })

      if (removeUrls.length > 0) {
        // remove urls
        await models.PubURLApp.destroy({
          where: {
            id: removeUrls.map(u => u.id),
          },
        }, { transaction })
      }
      if (data.length > 0) {
        // add or update urls
        await models.PubURLApp.bulkCreate(data, {
          updateOnDuplicate: ['url'],
        }, { transaction })
      }
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

    publishEvent(routingKeys.APP_UPDATED, {
      user_id: req.user.id,
      app_id: req.params.id,
      organization_id: req.user.org.id,
    })

    return res.status(HTTPStatus.OK).send(updated)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[UPDATE APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update the app'] })
  }
}

const createDraftApp = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const idp = await Idp.getIdP()

    let app = await models.App.create({
      name: req.body.name,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      redirect_url: req.body.redirectUrl || req.body.redirect_url,
      logo: req.body.logo,
      enable: true,
      org_id: req.user.org.id,
      idpProvider: idp.getProvider(),
      state: appStates.DRAFT,
      labels: req.body.labels || [],
      tosUrl: req.body.tosUrl,
      privacyUrl: req.body.privacyUrl,
      youtubeUrl: req.body.youtubeUrl,
      websiteUrl: req.body.websiteUrl,
      supportUrl: req.body.supportUrl,
    }, { transaction })

    if (typeof req.body.pub_urls !== 'undefined') {
      const data = []
      for (const pubUrl of req.body.pub_urls) {
        const puburlData = {
          url: pubUrl.url,
          app_id: app.id,
          type: pubUrl.type,
        }
        data.push(puburlData)
      }

      if (data.length > 0) {
        await models.PubURLApp.bulkCreate(data, { transaction })
      }
    }
    await transaction.commit()

    app = await models.App.findByPk(app.id, {
      attributes: appAttributes,
      include: includes(),
    })

    publishEvent(routingKeys.APP_CREATED, {
      user_id: req.user.id,
      app_id: app.id,
      organization_id: req.user.org.id,
    })

    return res.status(HTTPStatus.CREATED).send(app)
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[CREATE DRAFT APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ success: false, errors: ['Failed to create app.'] })
  }
}

const requestAccess = async (req, res) => {
  const app = await models.App.findOne({
    where: {
      id: req.params.id,
      org_id: req.user.org.id,
      state: appStates.DRAFT,
      enable: true,
    },
  })

  if (!app) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })
  }

  const subscriptionModel = await getSubscriptionModel()
  switch (subscriptionModel) {
    case subscriptionModels.SIMPLIFIED: {
      const idp = await Idp.getIdP()
      const client = await idp.createClient({
        clientName: app.name,
        redirectURIs: [app.redirect_url],
      })

      app.state = appStates.APPROVED
      app.clientId = client.clientId
      app.clientSecret = client.clientSecret
      app.client_data = client.extra
      app.idpProvider = idp.getProvider()

      const gateway = await Gateway()
      await gateway.subscribeAll(app.id, app.clientId)

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
    app_id: req.params.id,
    organization_id: req.user.org.id,
  })

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

const subscribeToAPI = async (req, res) => {
  const subscriptionModel = await getSubscriptionModel()
  if (subscriptionModel === subscriptionModels.SIMPLIFIED) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Current subscription model does not allow to manage subscriptions.'] })
  }

  const transaction = await sequelize.transaction()
  try {
    const subscriptions = req.body.subscriptions || []
    let app = await models.App.findOne({
      where: {
        id: req.params.id,
        org_id: req.user.org.id,
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
        id: req.params.id,
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
      }, {
        model: models.Organization,
        attributes: ['org_code'],
      }],
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
      org_code: app.organization.org_code,
    })
  } catch (err) {
    log.error(err, '[IS SUBSCRIBED TO]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to get apps subscriptions.'] })
  }
}

const listPublicApps = async (req, res, next) => {
  const filters = {
    visibility: 'public',
    enable: true,
    state: appStates.APPROVED,
  }

  if (req.query.org_id) {
    filters.org_id = {
      [Op.in]: Array.isArray(req.query.org_id) ? req.query.org_id : [req.query.org_id],
    }
  }

  if (req.query.label) {
    filters.labels = {
      [Op.overlap]: Array.isArray(req.query.label) ? req.query.label : [req.query.label],
    }
  }

  let search = {}
  if (req.query.search && typeof req.query.search === 'string') {
    const matchSearch = `%${req.query.search}%`
    search = {
      [Op.or]: [
        { name: { [Op.iLike]: matchSearch } },
        { '$organization.name$': { [Op.iLike]: matchSearch } },
        sequelize.literal(`EXISTS (SELECT * FROM unnest(labels) AS label WHERE label ILIKE '${matchSearch}')`),
      ],
    }
  }

  let order = []
  const sortOrder = req.query.order || 'asc'
  switch (req.query.sort_by) {
    case 'updated': {
      order = [
        ['updated_at', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    case 'org': {
      order = [
        [models.Organization, 'name', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    default: {
      order = [['name', sortOrder]]
      break
    }
  }

  const apps = await models.App.findAll({
    where: { ...filters, ...search },
    include: [{
      model: models.Organization,
      attributes: [
        'id',
        'name',
        'tosUrl',
        'privacyUrl',
        'supportUrl',
      ],
    }],
    attributes: [
      'id',
      'name',
      'description',
      'shortDescription',
      'logo',
      'labels',
      'tosUrl',
      'privacyUrl',
      'youtubeUrl',
      'websiteUrl',
      'supportUrl',
      'createdAt',
      'updatedAt',
      ['org_id', 'orgId'],
    ],
    order,
  })

  return res.status(HTTPStatus.OK).json(apps)
}

const listPublicLabels = async (req, res) => {
  // const sql = `
  //   SELECT DISTINCT unnest(labels) AS label
  //   FROM app
  //   WHERE visibility = 'public'
  //   AND enable = true
  //   AND state = 'approved'
  // ORDER BY label`
  // const labels = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })

  const labels = await models.App.findAll({
    attributes: [
      [
        sequelize.fn('distinct',
          sequelize.fn('unnest',
            sequelize.literal('labels'),
          ),
        ), 'label'],
    ],
    raw: true,
    where: {
      visibility: 'public',
      enable: true,
      state: appStates.APPROVED,
    },
    order: [[sequelize.literal('label')]],
  })

  return res.status(HTTPStatus.OK).json(labels.map((l) => l.label))
}

const publicAppDetails = async (req, res) => {
  const app = await models.App.findOne({
    where: {
      id: req.params.id,
      visibility: 'public',
      enable: true,
      state: appStates.APPROVED,
    },
    include: [{
      model: models.Organization,
      attributes: [
        'id',
        'name',
        'tosUrl',
        'privacyUrl',
        'supportUrl',
      ],
    }],
    attributes: [
      'id',
      'name',
      'description',
      'shortDescription',
      'logo',
      'labels',
      'tosUrl',
      'privacyUrl',
      'youtubeUrl',
      'websiteUrl',
      'supportUrl',
      'createdAt',
      'updatedAt',
      ['org_id', 'orgId'],
    ],
  })

  if (!app) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })
  }

  return res.status(HTTPStatus.OK).json(app)
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
  listPublicApps,
  listPublicLabels,
  publicAppDetails,
}
