const Kong = require('./kong')
const { NoGatewayError } = require('./errors')
const { models } = require('../../models')
const { settingTypes, gatewayProviders, subscriptionModels } = require('../../util/enums')

const getConfig = async () => {
  const settings = await models.Setting.findOne({
    where: { type: settingTypes.GATEWAY },
  })
  if (!settings || !settings.values) throw new NoGatewayError('Gateway configuration missing.')

  const planSettings = await models.Setting.findOne({
    where: { type: settingTypes.PLAN },
  })
  if (!planSettings || !planSettings.values) throw new Error('Plan settings missing.')

  return {
    subscriptionModel: planSettings.values.subscriptionModel || subscriptionModels.SIMPLIFIED,
    ...settings.values,
  }
}

const getGateway = async () => {
  const config = await getConfig()

  switch (config.provider) {
    case gatewayProviders.KONG: return new Kong(config.configuration)
    default: throw new NoGatewayError('Gateway Provider not supported.')
  }
}

module.exports = getGateway
