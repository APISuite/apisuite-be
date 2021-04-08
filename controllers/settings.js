const HTTPStatus = require('http-status-codes')
const merge = require('deepmerge')
const { Op } = require('sequelize')
const log = require('../util/logger')
const config = require('../config')
const { models, sequelize } = require('../models')
const msgBroker = require('../services/msg-broker')
const { settingTypes, idpProviders } = require('../util/enums')
const Gateway = require('../services/gateway')
const Idp = require('../services/idp')
const portalSettings = require('../util/portal-settings')

const createDefaultAccountSettings = (txn) => {
  return models.Setting.create({
    type: settingTypes.ACCOUNT,
    values: {},
  }, { transaction: txn })
}

const createDefaultPortalSettings = (txn) => {
  return models.Setting.create({
    type: settingTypes.PORTAL,
    values: portalSettings,
  }, { transaction: txn })
}

const upsertSettings = async (payload, type) => {
  const settings = await models.Setting.findOne({
    where: { type },
  })

  if (!settings) {
    return models.Setting.create({
      type,
      values: payload,
    }, {
      returning: true,
    })
  }

  settings.values = merge(settings.values, payload)
  return settings.save({
    returning: true,
  })
}

const get = async (req, res) => {
  try {
    let mergedSettings = {}
    const settings = await models.Setting.findAll({
      where: {
        [Op.or]: [
          { type: settingTypes.ACCOUNT },
          { type: settingTypes.PORTAL },
          { type: settingTypes.IDP },
        ],
      },
    })

    let accountSettings = settings.find((s) => s.type === settingTypes.ACCOUNT)
    if (!accountSettings) {
      accountSettings = await createDefaultAccountSettings()
    }
    mergedSettings = {
      ...accountSettings.values,
      sso: [],
      providerSignupURL: ''
    }

    let portalSettings = settings.find((s) => s.type === settingTypes.PORTAL)
    if (!portalSettings) {
      portalSettings = await createDefaultPortalSettings()
    }
    mergedSettings = {
      ...mergedSettings,
      ...portalSettings.values,
    }

    const idp = await Idp.getIdP()
    if (idp.getProvider() !== idpProviders.INTERNAL) {
      const ssoClient = await models.SSOClient.findOne({
        where: { provider: idp.getProvider() },
      })

      if (ssoClient) {
        mergedSettings.sso = [ssoClient.provider]

        const idpSettings = settings.find((s) => s.type === settingTypes.IDP)
        if (idpSettings && idpSettings.values.configuration.providerSignupURL) {
          mergedSettings.providerSignupURL = idpSettings.values.configuration.providerSignupURL
        }
      }
    }

    return res.status(HTTPStatus.OK).send(mergedSettings)
  } catch (error) {
    log.error(error, '[SETTINGS get]')
    return res.sendInternalError()
  }
}

const upsert = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    let settings = await models.Setting.findOne({
      where: { type: settingTypes.ACCOUNT },
      transaction,
    })

    if (!settings) {
      settings = await createDefaultAccountSettings(transaction)
    }

    const newSettings = settings.values

    for (const prop in req.body) {
      newSettings[prop] = req.body[prop]
    }

    const [rowsUpdated, [updated]] = await models.Setting.update(
      { values: newSettings },
      {
        where: { type: settingTypes.ACCOUNT },
        returning: true,
        transaction,
      },
    )

    await transaction.commit()

    if (!rowsUpdated) {
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Account Settings not found'] })
    }

    settings = await models.Setting.findOne({
      where: { type: settingTypes.ACCOUNT },
    })

    msgBroker.publishEvent(msgBroker.routingKeys.SETTINGS_UPDATED, {
      portalOwner: settings.values.clientName,
      portalTitle: settings.values.portalName,
    })

    return res.status(HTTPStatus.OK).send(updated.values)
  } catch (err) {
    if (transaction) {
      await transaction.rollback()
    }
    log.error(err, '[SETTINGS upsert]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update the settings'] })
  }
}

const getIdp = async (req, res) => {
  try {
    const settings = await models.Setting.findOne({
      where: { type: settingTypes.IDP },
    })

    return res.status(HTTPStatus.OK).send(cleanInternalConfig(settings.values))
  } catch (error) {
    log.error(error, '[SETTINGS getIdp]')
    return res.sendInternalError()
  }
}

const updateIdp = async (req, res) => {
  req.body.provider = req.body.provider.toLowerCase()
  const transaction = await sequelize.transaction()
  try {
    let ssoEnabled = false
    let settings = await models.Setting.findOne({
      where: { type: settingTypes.IDP },
      transaction,
    })

    if (!settings) {
      settings = await models.Setting.create({
        type: settingTypes.IDP,
        values: {},
      }, { transaction })
    }

    ssoEnabled = settings.values &&
      settings.values.configuration &&
      !!settings.values.configuration.ssoEnabled

    if (req.body.provider === idpProviders.INTERNAL) {
      req.body.configuration = {
        clientsURL: config.get('hydra.clientsURL'),
      }
    }

    if (!Object.prototype.hasOwnProperty.call(req.body.configuration, 'ssoEnabled')) {
      req.body.configuration.ssoEnabled = false
    }

    settings.values = req.body
    await settings.save({ transaction })

    await transaction.commit()

    const ssoChanged = ssoEnabled !== req.body.configuration.ssoEnabled
    if (ssoChanged) {
      try {
        await toggleSSO(settings.values.configuration.ssoEnabled)
      } catch (err) {
        req.body.configuration.ssoEnabled = ssoEnabled
        settings.values = req.body
        await settings.save()
        return res.sendInternalError('Could not enable/disable SSO')
      }
    }

    return res.status(HTTPStatus.OK).send(cleanInternalConfig(settings.values))
  } catch (error) {
    if (transaction) {
      await transaction.rollback()
    }
    log.error(error, '[SETTINGS updateIdp]')
    return res.sendInternalError()
  }
}

const getGateway = async (req, res) => {
  try {
    const settings = await models.Setting.findOne({
      where: { type: settingTypes.GATEWAY },
    })
    if (!settings) {
      return res.status(HTTPStatus.OK).send({
        provider: 'kong', // only provider we currently have
        configuration: {
          url: '',
          apiKey: '',
        },
      })
    }
    return res.status(HTTPStatus.OK).send(settings.values)
  } catch (error) {
    log.error(error, '[SETTINGS getGateway]')
    return res.sendInternalError()
  }
}

const setGateway = async (req, res) => {
  try {
    const settings = await upsertSettings(req.body, settingTypes.GATEWAY)
    return res.status(HTTPStatus.OK).send(settings.values)
  } catch (error) {
    log.error(error, '[SETTINGS setGateway]')
    return res.sendInternalError()
  }
}

const syncGateway = async (req, res) => {
  try {
    const gateway = await Gateway()
    const { statusCode, services } = await gateway.getServicesData()
    if (statusCode >= HTTPStatus.BAD_REQUEST) {
      return res.status(HTTPStatus.BAD_REQUEST).send({
        errors: [
          'The request with the inputed url and apiKey failed. ' +
          'Please verify if the input is correct and try again.',
        ],
      })
    }
    const result = await gateway.setupApisFromServices(services)
    return res.status(HTTPStatus.OK).send({
      message: result,
    })
  } catch (error) {
    log.error(error, '[syncGateway]')
    return res.sendInternalError()
  }
}

/**
 * @param {object} settings
 * @param {string} settings.provider
 * @param {object} settings.configuration
 * */
const cleanInternalConfig = (settings) => {
  if (settings.provider === idpProviders.INTERNAL) {
    settings.configuration = {}
  }
  return settings
}

const toggleSSO = async (enable) => {
  const idp = await Idp.getIdP()

  if (idp.getProvider() === idpProviders.INTERNAL) {
    throw new Error('Internal IDP does not support SSO')
  }

  const ssoClient = await models.SSOClient.findOne({
    where: { provider: idp.getProvider() },
  })

  if (enable) {
    return enableSSO(idp, ssoClient)
  }
  return disableSSO(idp, ssoClient)
}

const enableSSO = async (idp, ssoClient) => {
  if (ssoClient) return

  const client = await idp.createClient({
    clientName: 'APISuite SSO Client',
    redirectURIs: [
      config.get('sso.signInRedirectURL'),
      config.get('sso.inviteSignInRedirectURL'),
    ],
  })

  await models.SSOClient.create({
    provider: idp.getProvider(),
    clientId: client.clientId.startsWith('_') ? client.clientId.substring(1) : client.clientId,
    clientSecret: client.clientSecret,
    clientData: client.extra,
  })
}

const disableSSO = async (idp, ssoClient) => {
  if (!ssoClient) return

  await idp.deleteClient(ssoClient.clientId, ssoClient.clientData)
  await ssoClient.destroy()
}

const getPortalSettings = async (req, res) => {
  let settings = await models.Setting.findOne({
    where: { type: settingTypes.PORTAL },
  })

  if (!settings) {
    settings = await models.Setting.create({
      type: settingTypes.PORTAL,
      values: portalSettings,
    })
  }

  return res.status(HTTPStatus.OK).send(settings.values)
}

const updatePortalSettings = async (req, res) => {
  let settings = await models.Setting.findOne({
    where: { type: settingTypes.PORTAL },
  })

  if (!settings) {
    return models.Setting.create({
      type: settingTypes.PORTAL,
      values: req.body,
    }, {
      returning: true,
    })
  }

  settings.values = req.body
  settings = await settings.save({ returning: true })

  return res.status(HTTPStatus.OK).send(settings.values)
}

module.exports = {
  get,
  upsert,
  getPortalSettings,
  updatePortalSettings,
  getIdp,
  updateIdp,
  getGateway,
  setGateway,
  syncGateway,
}
