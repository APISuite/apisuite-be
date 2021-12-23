const log = require('../util/logger')
const { v4: uuidv4 } = require('uuid')
const HTTPStatus = require('http-status-codes')

module.exports = (err, req, res, next) => {
  if (err?.status === 413) {
    return res.status(HTTPStatus.REQUEST_TOO_LONG).send({ errors: ['Request payload too large'] })
  }

  const errorId = uuidv4()
  log.error({ err, error_id: errorId })
  res.sendInternalError(`Something went wrong while handling your request. Here's an error reference in case you contact support: ${errorId}`)
}
