const HTTPStatus = require('http-status-codes')

module.exports = (req, res, next) => {
  try {
    if (res.locals.loggedInUser) {
      req.user = res.locals.loggedInUser

      return next()
    }

    if (res.locals.loggedInApp) {
      req.app = res.locals.loggedInApp
      return next()
    }

    return res.status(HTTPStatus.UNAUTHORIZED).json({
      errors: ['You are not logged in'],
    })
  } catch (error) {
    next(error)
  }
}
