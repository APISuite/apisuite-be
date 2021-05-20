const Joi = require('joi')
const validator = require('./validator')

const appMetadata = Joi.object({
  key: Joi.string().max(30).required(),
  value: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().optional(),
})

const appSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null, ''),
  shortDescription: Joi.string().max(60).optional().allow(null, ''),
  redirectUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
  visibility: Joi.string().valid('public', 'private').optional(),
  logo: Joi.string().optional().allow(null, ''),
  pub_urls: Joi.array().items(
    Joi.object({
      url: Joi.alternatives().try(
        Joi.string(),
        Joi.string().email({ tlds: { allow: false } }),
      ).required(),
      type: Joi.string().valid('client', 'tos', 'policy', 'support', 'support_email').required(),
    }).optional(),
  ).optional().allow(null),
  labels: Joi.array().items(Joi.string()).optional(),
  subscriptions: Joi.array().items(Joi.number().min(0).optional()).optional().allow(null),
  tosUrl: Joi.string().optional().allow(null, ''),
  privacyUrl: Joi.string().optional().allow(null, ''),
  youtubeUrl: Joi.string().optional().allow(null, ''),
  websiteUrl: Joi.string().optional().allow(null, ''),
  supportUrl: Joi.string().optional().allow(null, ''),
  metadata: Joi.array().items(appMetadata).optional().allow(null),
})

const subscriptionSchema = Joi.object({
  subscriptions: Joi.array().items(Joi.number().min(0)).required(),
})

const publicAppsQuerySchema = Joi.object({
  search: Joi.string().optional(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).optional(),
  org_id: Joi.alternatives().try(
    Joi.number(),
    Joi.array().min(1).items(Joi.number()),
  ).optional(),
  label: Joi.alternatives().try(
    Joi.string(),
    Joi.array().min(1).items(Joi.string()),
  ).optional(),
  sort_by: Joi.string().valid('app', 'org', 'updated').optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
})

const deleteMediaSchema = Joi.object({
  images: Joi.array().items(Joi.string()).min(1).required(),
})

const appPatchSchema = Joi.object({
  visibility: Joi.string().valid('public', 'private').optional(),
  labels: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.array().items(appMetadata).optional(),
})

module.exports = {
  validateAppBody: validator(appSchema),
  validateAppPatchBody: validator(appPatchSchema),
  validateSubscriptionBody: validator(subscriptionSchema),
  validatePublicAppsListQuery: validator(publicAppsQuerySchema, 'query'),
  deleteMediaBody: validator(deleteMediaSchema),
}
