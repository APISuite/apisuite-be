const Joi = require('joi')
const validator = require('./validator')
const { idpProviders } = require('../../util/enums')

const validSocials = [
  'web',
  'github',
  'gitlab',
  'facebook',
  'twitter',
  'linkedin',
  'reddit',
  'instagram',
  'other',
]

const settingsSchema = Joi.object({
  portalName: Joi.string().optional().allow(''),
  clientName: Joi.string().optional().allow(''),
  documentationURL: Joi.string().optional().allow(''),
  supportURL: Joi.string().optional().allow(''),
  socialURLs: Joi.array().items(
    Joi.object({
      name: Joi.string().valid(...validSocials).required(),
      url: Joi.string().required().allow(''),
    }),
  ).optional(),
})

const gatewaySettingsSchema = Joi.object({
  provider: Joi.string().required().valid('kong'),
  configuration: Joi.object({
    url: Joi.string().uri().required(),
    apiKey: Joi.string().required(),
  }),
})

const internalIdpConfig = Joi.object({})
const keycloakIdpConfig = Joi.object({
  clientRegistrationURL: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
  discoveryURL: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
  initialAccessToken: Joi.string().required(),
  ssoEnabled: Joi.boolean().optional(),
  providerSignupURL: Joi.string().optional().allow(null, ''),
})

const idpSettingsSchema = Joi.object({
  provider: Joi.string().required().valid(...Object.values(idpProviders)),
  configuration: Joi
    .when('provider', {
      is: idpProviders.INTERNAL,
      then: internalIdpConfig,
    })
    .when('provider', {
      is: idpProviders.KEYCLOAK,
      then: keycloakIdpConfig,
    }),
})

module.exports = {
  validateSettingsBody: validator(settingsSchema),
  validateGatewaySettingsBody: validator(gatewaySettingsSchema),
  validateIdPSettingsBody: validator(idpSettingsSchema),
}
