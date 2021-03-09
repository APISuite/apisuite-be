const validator = require('./validator')
const Joi = require('joi')

const organizationAssignUserBodySchema = Joi.object({
  user_id: Joi.string().required(),
  org_id: Joi.string().required(),
}).options({
  allowUnknown: true,
})

const organizationSchema = (create) => {
  const baseSchema = {
    description: Joi.string().optional().allow(null, ''),
    vat: Joi.string().optional().allow(null, ''),
    logo: Joi.string().optional().allow(null, ''),
    tosUrl: Joi.string().optional().allow(null, ''),
    privacyUrl: Joi.string().optional().allow(null, ''),
    youtubeUrl: Joi.string().optional().allow(null, ''),
    websiteUrl: Joi.string().optional().allow(null, ''),
    supportUrl: Joi.string().optional().allow(null, ''),
  }

  baseSchema.name = create
    ? Joi.string().required()
    : Joi.string().optional()

  return Joi.object(baseSchema)
}

module.exports = {
  validateOrganizationUpdateBody: validator(organizationSchema(false)),
  validateOrgBody: validator(organizationSchema(true)),
  validateAssignUserBody: validator(organizationAssignUserBodySchema),
}
