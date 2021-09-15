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
const page = require('./page')
const translations = require('./translations')
const settingsStorefronts = require('./settings_strorefronts')

module.exports = {
  api,
  app,
  auth,
  health,
  invites,
  organization,
  owner,
  page,
  role,
  registration,
  settings,
  translations,
  user,
  settingsStorefronts,
}
