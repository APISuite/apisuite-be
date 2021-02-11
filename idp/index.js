const Hydra = require('./hydra')
const Keycloak = require('./keycloak')

const { models } = require('../models')
const { settingTypes, idpProviders } = require('../util/enums')

const getConfig = async () => {
  const settings = await models.Setting.findOne({
    where: { type: settingTypes.IDP },
  })
  if (!settings || !settings.values) throw new Error('IdP configuration missing')
  return settings.values
}

const getIdP = async () => {
  const config = await getConfig()

  switch (config.provider) {
    case idpProviders.INTERNAL: return new Hydra(config)
    case idpProviders.KEYCLOAK: return new Keycloak(config)
    default: throw new Error('IdP Provider not implemented')
  }
}

module.exports = getIdP
