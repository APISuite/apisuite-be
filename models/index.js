const config = require('../config')
const { Sequelize, DataTypes } = require('sequelize')

const dbConfig = config.get('db')

const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
  },
)

const importModel = (modelFile) => {
  return require(modelFile)(sequelize, DataTypes)
}

const models = {
  Api: importModel('./api'),
  ApiVersion: importModel('./api_version'),
  ApiVersionRoute: importModel('./api_version_route'),
  APIToken: importModel('./api_token'),
  App: importModel('./app'),
  AppSubscription: importModel('./app_subscription'),
  Functions: importModel('./functions'),
  InviteOrganization: importModel('./invite_organization'),
  Organization: importModel('./organization'),
  PasswordRecovery: importModel('./password_recovery'),
  PubURLApp: importModel('./puburl_app'),
  RefreshToken: importModel('./refresh_token'),
  Role: importModel('./role'),
  Setting: importModel('./setting'),
  SSOClient: importModel('./sso_client'),
  Translation: importModel('./translation'),
  User: importModel('./user'),
  UserOrganization: importModel('./user_organization'),
  UserRegistration: importModel('./user_registration'),
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

module.exports = {
  models,
  sequelize,
}
