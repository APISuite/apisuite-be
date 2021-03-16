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

module.exports = {
  api,
  app,
  auth,
  functions,
  invites,
  organization,
  owner,
  role,
  registration,
  settings,
  user,
}
