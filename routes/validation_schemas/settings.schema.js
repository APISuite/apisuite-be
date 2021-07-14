const Joi = require('joi')
const validator = require('./validator')
const config = require('../../config')
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
  discoveryURL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  initialAccessToken: Joi.string().optional(),
  ssoEnabled: Joi.boolean().optional(),
  providerSignupURL: Joi.string().optional().allow(null, ''),
  preConfiguredClient: Joi.object({
    clientId: Joi.string().required(),
    clientSecret: Joi.string().required(),
    extra: Joi.object({
      registration_client_uri: Joi.string().required(),
      registration_access_token: Joi.string().required(),
    }).required(),
  }).optional(),
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

const portalSettingsSchema = Joi.object({
  i18nOptions: Joi.array().items(Joi.object()),
  theme: Joi.object(),
  navigation: Joi.object({
    title: Joi.object({
      route: Joi.string().allow(''),
      iconFallbackName: Joi.string().allow('').optional(),
    }),
    admin: Joi.object().optional(),
    organizationOwner: Joi.object().optional(),
    developer: Joi.object().optional(),
    baseUser: Joi.object().optional(),
    anonymous: Joi.object().optional(),
  }).optional(),
})

module.exports = {
  validateSettingsBody: validator(settingsSchema),
  validateGatewaySettingsBody: validator(gatewaySettingsSchema),
  validateIdPSettingsBody: validator(idpSettingsSchema),
  validatePortalSettingsBody: validator(portalSettingsSchema),
}
