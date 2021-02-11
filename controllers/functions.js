const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const { models } = require('../models')

const getFunctions = async (req, res) => {
  try {
    const functions = await models.Functions.findAll()
    return res.status(HTTPStatus.OK).send(functions)
  } catch (error) {
    log.error(error, '[ADMIN getFunctions]')
    return res.sendInternalError()
  }
}

module.exports = {
  getFunctions,
}
