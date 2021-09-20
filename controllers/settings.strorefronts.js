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

  const transaction = await sequelize.transaction()

  try {
    const settings = await models.SettingsStoreFronts.findOne({
      where: { name: req.params.name },
      transaction,
    })

    if (!settings) {
      await models.SettingsStoreFronts.create(
        {
          name: req.params.name,
          values: req.body,
        },
        {
          transaction,
        },
      )
      await transaction.commit()
      return res.status(HTTPStatus.OK).send(req.body)
    }

    settings.values = req.body
    await settings.save({ transaction })

    await transaction.commit()

    return res.status(HTTPStatus.OK).send(req.body)
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
