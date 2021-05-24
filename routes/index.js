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
const translations = require('./translations')

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
  translations,
  user,
}
