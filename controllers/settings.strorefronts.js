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
  const settings = await models.SettingsStoreFronts.findOne({ where: { name: req.params.name } })
  const transaction = await sequelize.transaction()
  try {
    if (!settings) {
      const insert = await models.SettingsStoreFronts.create(
        {
          name: req.params.name,
          values: req.body,
        },
        {
          where: { name: req.params.name },
          returning: true,
        },
      )
      if (!insert) {
        await transaction.rollback()
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Insert Settings'] })
      }
      return res.status(HTTPStatus.CREATED).send({ success: ['Settings Inserted'] })
    }
    const updated = await models.SettingsStoreFronts.update(
      {
        values: req.body,
      },
      {
        where: { name: req.params.name },
        returning: true,
      },
    )
    if (!updated) {
      await transaction.rollback()
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Update Settings'] })
    }
    return res.status(HTTPStatus.OK).send({ success: ['Settings Updated'] })
  } catch (error) {
    if (transaction) await transaction.rollback()
    log.error(error, '[UPDATE STOREFRONTS SETTINGS]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Update Settings'] })
  }
}

module.exports = {
  get,
  put,
}
