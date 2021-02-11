const log = require('../util/logger')
const { v4: uuidv4 } = require('uuid')

module.exports = (err, req, res, next) => {
  const errorId = uuidv4()
  log.error({ err, error_id: errorId })
  res.sendInternalError(`Something went wrong while handling your request. Here's an error reference in case you contact support: ${errorId}`)
}
