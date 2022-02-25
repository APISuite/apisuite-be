const HTTPStatus = require('http-status-codes')
const { models } = require('../models')
const log = require('../util/logger')

const get = async (req, res) => {
  const types = await models.AppType.findAll()
  return res.status(HTTPStatus.OK).send(types)
}

const post = async (req, res) => {
  const createdAppType = await models.AppType.create({
    type: req.body.type,
  })

  if (!createdAppType) {
    log.error('[CREATE APP TYPE]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Create App Type'] })
  }

  return res.status(HTTPStatus.CREATED).send(createdAppType)
}

const deleteType = async (req, res) => {
  const deleteAppType = await models.AppType.destroy({
    where: {
      type: req.body.type,
    },
  })

  if (!deleteAppType) {
    log.error('[DELETE APP TYPE]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Delete App Type'] })
  }

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  get,
  post,
  deleteType,
}
