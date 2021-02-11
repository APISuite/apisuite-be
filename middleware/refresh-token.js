const HTTPStatus = require('http-status-codes')

module.exports = (req, res, next) => {
  if (!req.cookies || !req.cookies.refresh_token) {
    return res.status(HTTPStatus.UNAUTHORIZED).json({
      errors: ['Request is missing refresh token'],
    })
  }

  next()
}
