const validator = require('./validator')
const Joi = require('joi')

const organizationSchema = (create) => {
  const baseSchema = {
    description: Joi.string().optional().allow(null, ''),
    vat: Joi.string().optional().allow(null, ''),
    logo: Joi.string().optional().allow(null, ''),
    tosUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
    privacyUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
    youtubeUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
    websiteUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
    supportUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional().allow(null, ''),
    address: Joi.object({
      address: Joi.string().optional().allow(null, ''),
      postalCode: Joi.string().optional().allow(null, ''),
      city: Joi.string().optional().allow(null, ''),
      country: Joi.string().optional().allow(null, ''),
    }).optional(),
  }

  if (create) {
    baseSchema.options = Joi.object({
      selfAssignNewOrganization: Joi.boolean().optional(),
    }).optional()
  }

  baseSchema.name = create
    ? Joi.string().required()
    : Joi.string().optional()

  return Joi.object(baseSchema)
}

module.exports = {
  validateOrganizationUpdateBody: validator(organizationSchema(false)),
  validateOrgBody: validator(organizationSchema(true)),
}
