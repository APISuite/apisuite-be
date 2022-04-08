const user = require('./user')
const api = require('./api')
const app = require('./app')
const auth = require('./auth')
const health = require('./health')
const organization = require('./organization')
const registration = require('./registration')
const role = require('./role')
const settings = require('./settings')
const invites = require('./invites')
const owner = require('./owner')
const page = require('./page')
const translations = require('./translations')
const settingsStorefronts = require('./settings.storefronts')
const media = require('./media')
const resource = require('./resource')
const plan = require('./subscription_plan')
module.exports = {
  api,
  app,
  auth,
  health,
  invites,
  organization,
  owner,
  registration,
  role,
  settings,
  translations,
  user,
  page,
  settingsStorefronts,
  media,
  resource,
  plan,
}
