const user = require('./user')
const app = require('./app')
const auth = require('./auth')
const organization = require('./organization')
const registration = require('./registration')
const role = require('./role')
const api = require('./api')
const health = require('./health')
const settings = require('./settings')
const invites = require('./invites')
const owner = require('./owner')
const translations = require('./translations')

module.exports = {
  api,
  app,
  auth,
  health,
  invites,
  organization,
  owner,
  role,
  registration,
  settings,
  translations,
  user,
}
