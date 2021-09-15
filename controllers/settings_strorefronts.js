const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')
const log = require('../util/logger')


const get = async (req, res) => {
  try {
    let store = req.url.replace(/^\/+/, '')

    const settings = await models.SettingsStoreFronts.findOne({
      where: { store: store },
    })

    if (settings) {
      return res.status(HTTPStatus.OK).send(settings.dataValues.values)
    } else {
      return res.status(HTTPStatus.NOT_FOUND).send({errors: ['Store does not exist.']})
    }

  } catch (error) {
    log.error(error, '[SETTINGS get]')
    return res.sendInternalError()
  }
}

module.exports = {
  get,
}
