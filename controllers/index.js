const user = require('./user')
const app = require('./app')
const auth = require('./auth')
const organization = require('./organization')
const registration = require('./registration')
const role = require('./role')
const functions = require('./functions')
const api = require('./api')
const settings = require('./settings')
const invites = require('./invites')
const owner = require('./owner')
const media = require('./media')

module.exports = {
  api,
  app,
  auth,
  functions,
  invites,
  media,
  organization,
  owner,
  role,
  registration,
  settings,
  user,
}
