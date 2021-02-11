const HTTPStatus = require('http-status-codes')
const merge = require('deepmerge')
const log = require('../util/logger')
const config = require('../config')
const { models, sequelize } = require('../models')
const msgBroker = require('../services/msg-broker')
const { settingTypes, idpProviders } = require('../util/enums')
const Gateway = require('../util/gateway')

const createDefaultAccountSettings = (txn) => {
  return models.Setting.create({
    type: settingTypes.ACCOUNT,
    values: {},
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
    let settings = await models.Setting.findOne({
      where: { type: settingTypes.ACCOUNT },
    })

    if (!settings) {
      settings = await createDefaultAccountSettings()
    }

    return res.status(HTTPStatus.OK).send(settings.values)
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
  const transaction = await sequelize.transaction()
  try {
    const settings = await models.Setting.findOne({
      where: { type: settingTypes.IDP },
      transaction,
    })

    if (!settings) {
      await models.Setting.create({
        type: settingTypes.IDP,
        values: {},
      }, { transaction })
    }

    if (req.body.provider === idpProviders.INTERNAL) {
      req.body.configuration = {
        clientsURL: config.get('hydra.clientsURL'),
      }
    }

    const [rowsUpdated, [updated]] = await models.Setting.update(
      { values: req.body },
      {
        where: { type: settingTypes.IDP },
        returning: true,
        transaction,
      },
    )

    if (!rowsUpdated) {
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['IdP Settings not found'] })
    }

    await transaction.commit()

    return res.status(HTTPStatus.OK).send(cleanInternalConfig(updated.values))
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

module.exports = {
  get,
  upsert,
  getIdp,
  updateIdp,
  getGateway,
  setGateway,
  syncGateway,
}
