const validator = require('./validator')
const Joi = require('joi')

const organizationAPISchema = Joi.object({
  name: Joi.string().required(),
}).options({
  allowUnknown: true,
})

const organizationAssignUserBodySchema = Joi.object({
  user_id: Joi.string().required(),
  org_id: Joi.string().required(),
}).options({
  allowUnknown: true,
})

const organizationUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional().allow(null, ''),
  vat: Joi.string().optional().allow(null, ''),
  logo: Joi.string().optional().allow(null, ''),
  tosUrl: Joi.string().optional().allow(null, ''),
  privacyUrl: Joi.string().optional().allow(null, ''),
  youtubeUrl: Joi.string().optional().allow(null, ''),
  websiteUrl: Joi.string().optional().allow(null, ''),
  supportUrl: Joi.string().optional().allow(null, ''),
})

module.exports = {
  validateOrganizationUpdateBody: validator(organizationUpdateSchema),
  validateOrgBody: validator(organizationAPISchema),
  validateAssignUserBody: validator(organizationAssignUserBodySchema),
}
