const user = require('./user')
const api = require('./api')
const app = require('./app')
const auth = require('./auth')
const organization = require('./organization')
const registration = require('./registration')
const functions = require('./functions')
const role = require('./role')
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
  registration,
  role,
  settings,
  user,
}
