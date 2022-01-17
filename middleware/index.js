const auth = require('./auth')
const error = require('./error')
const setup = require('./setup')
const internalError = require('./internal-error')
const accessControl = require('./access-control')
const loggedIn = require('./logged-in')
const refreshToken = require('./refresh-token')
const fileParser = require('./file-parser')
const recaptcha = require('./recaptcha')

module.exports = {
  auth,
  error,
  setup,
  accessControl,
  internalError,
  loggedIn,
  refreshToken,
  fileParser,
  recaptcha,
}
