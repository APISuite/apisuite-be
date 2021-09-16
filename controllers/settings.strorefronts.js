const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')
const log = require('../util/logger')

const get = async (req, res) => {
  const settings = await models.SettingsStoreFronts.findOne({ where: { name: req.params.name } })

  if (!settings) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Name does not exist.'] })
  }
  return res.status(HTTPStatus.OK).send(settings.values)
}

const put = async (req, res) => {
  if (!req.body.name || !req.body.payload) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['name and payload fields not exist. Are mandatory fields.'] })
  }
  const settings = await models.SettingsStoreFronts.findOne({ where: { name: req.body.name } })
  if (settings) {
    const dbOperationUpdate = await sequelize.transaction()
    try {
      const [rowsUpdated, [updated]] = await models.SettingsStoreFronts.update(
        {
          values: req.body.payload,
        },
        {
          where: { name: req.body.name },
          returning: true,
        },
      )
      if (!rowsUpdated) {
        await dbOperationUpdate.rollback()
        return res.status(HTTPStatus.BAD_GATEWAY).send({ errors: ['Failed to Update Settings'] })
      }
      if (updated) {
        return res.status(HTTPStatus.OK).send({ errors: ['Settings Updated'] })
      }
    } catch (error) {
      if (dbOperationUpdate) await dbOperationUpdate.rollback()
      log.error(error, '[UPDATE STOREFRONTS SETTINGS]')
      return res.status(HTTPStatus.BAD_GATEWAY).send({ errors: ['Failed to Update Settings'] })
    }
  }

  const dbOperationInsert = await sequelize.transaction()
  try {
    const insert = await models.SettingsStoreFronts.create(
      {
        name: req.body.name,
        values: req.body.payload,
      },
      {
        where: { name: req.body.name },
        returning: true,
      },
    )
    if (insert) {
      return res.status(HTTPStatus.CREATED).send({ errors: ['Settings Inserted'] })
    }
  } catch (error) {
    if (dbOperationInsert) await dbOperationInsert.rollback()
    log.error(error, '[INSERT STOREFRONTS SETTINGS]')
    return res.status(HTTPStatus.BAD_GATEWAY).send({ errors: ['Failed to Insert Settings'] })
  }
}

module.exports = {
  get,
  put,
}
