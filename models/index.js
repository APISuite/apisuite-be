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
  AppMetadata: importModel('./app_metadata'),
  AppSubscription: importModel('./app_subscription'),
  InviteOrganization: importModel('./invite_organization'),
  Organization: importModel('./organization'),
  PasswordRecovery: importModel('./password_recovery'),
  Page: importModel('./page'),
  RefreshToken: importModel('./refresh_token'),
  Role: importModel('./role'),
  Setting: importModel('./setting'),
  SSOClient: importModel('./sso_client'),
  Translation: importModel('./translation'),
  User: importModel('./user'),
  UserOrganization: importModel('./user_organization'),
  UserRegistration: importModel('./user_registration'),
  SettingsStoreFronts: importModel('./settings_storefronts'),
  Address: importModel('./address'),
  Media: importModel('./media'),
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
