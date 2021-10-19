const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')
const log = require('../util/logger')

const get = async (req, res) => {
  const types = await models.AppType.findAll()
  if (!types) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['No App Types defined'] })
  }
  return res.status(HTTPStatus.OK).send(types)
}

const post = async (req, res) => {
  const createAppType = await models.AppType.create({
    type: req.body.type,
  })

  if (!createAppType) {
    log.error('[UPDATE STOREFRONTS SETTINGS]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Create App Types'] })
  }

  return res.status(HTTPStatus.CREATED).send(req.body)
}

module.exports = {
  get,
  post,
}
