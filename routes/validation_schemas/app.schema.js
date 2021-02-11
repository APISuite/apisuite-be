const Joi = require('joi')
const validator = require('./validator')

const appSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null, ''),
  redirect_url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  visibility: Joi.string().valid('public', 'private').optional(),
  logo: Joi.string().optional().allow(null),
  pub_urls: Joi.array().items(
    Joi.object({
      url: Joi.alternatives().try(
        Joi.string(),
        Joi.string().email({ tlds: { allow: false } }),
      ).required(),
      type: Joi.string().valid('client', 'tos', 'policy', 'support', 'support_email').required(),
    }).optional(),
  ).optional().allow(null),
  subscriptions: Joi.array().items(Joi.number().min(0).optional()).optional().allow(null),
  tosUrl: Joi.string().optional().allow(null),
  privacyUrl: Joi.string().optional().allow(null),
  youtubeUrl: Joi.string().optional().allow(null),
  websiteUrl: Joi.string().optional().allow(null),
  supportUrl: Joi.string().optional().allow(null),
})

const subscriptionSchema = Joi.object({
  subscriptions: Joi.array().items(Joi.number().min(0)).required(),
})

module.exports = {
  validateAppBody: validator(appSchema),
  validateSubscriptionBody: validator(subscriptionSchema),
}
