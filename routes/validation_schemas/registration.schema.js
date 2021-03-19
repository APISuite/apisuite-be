const Joi = require('joi')
const validator = require('./validator')
const { validatePassword } = require('./user.schema')

const userDetailsSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required().required(),
  token: Joi.string().optional(),
})

const organizationDetailsSchema = Joi.object({
  registrationToken: Joi.string().guid({ version: 'uuidv4' }).required(),
  name: Joi.string().required(),
  website: Joi.string().optional().allow('', null),
})

const securityDetailsSchema = Joi.object({
  registrationToken: Joi.string().guid({ version: 'uuidv4' }).required(),
  password: Joi.string().required(),
})

const userConfirmSchema = Joi.object({
  token: Joi.string().guid({ version: 'uuidv4' }).required(),
})

const securityDetailsBodyExtraValidator = (body) => {
  const res = validatePassword(body.password)
  return { errors: res.errors }
}

module.exports = {
  validateUserDetailsBody: validator(userDetailsSchema),
  validateOrganizationDetailsBody: validator(organizationDetailsSchema),
  validateSecurityDetailsBody: validator(securityDetailsSchema, 'body', securityDetailsBodyExtraValidator),
  validateUserConfirmBody: validator(userConfirmSchema),
  validateUserRegistrationInvitationBody: validator(userConfirmSchema),
}
