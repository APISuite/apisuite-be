const HTTPStatus = require('http-status-codes')

module.exports = (req, res, next) => {
  res.sendInternalError = (msg) => (
    res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .send({ errors: [msg || 'Something went wrong trying to process your request. Try again later.'] })
  )

  next()
}
