const user = require('./user')
const api = require('./api')
const app = require('./app')
const auth = require('./auth')
const organization = require('./organization')
const registration = require('./registration')
const role = require('./role')
const settings = require('./settings')
const invites = require('./invites')
const owner = require('./owner')
const media = require('./media')

module.exports = {
  api,
  app,
  auth,
  invites,
  organization,
  owner,
  registration,
  role,
  settings,
  user,
  media,
}
