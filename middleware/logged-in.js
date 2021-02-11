const HTTPStatus = require('http-status-codes')
const msgBroker = require('../services/msg-broker')

module.exports = (req, res, next) => {
  try {
    if (res.locals.loggedInUser) {
      req.user = res.locals.loggedInUser

      if (req.user.org) {
        msgBroker.publishEvent(msgBroker.routingKeys.ORG_ACTIVITY, {
          id: req.user.org.id,
          name: req.user.org.name,
        })
      }

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
