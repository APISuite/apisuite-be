const Joi = require('joi')
const validator = require('./validator')

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().required(),
})

// TODO deprecate
const deprecatedUserProfileSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().optional().allow('', null),
  org_id: Joi.string().optional().allow('', null),
  avatar: Joi.string().optional().allow('', null),
  mobile: Joi.string().optional().allow('', null),
})

const userChangePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().required(),
})

const userSetupSchema = Joi.object({
  email: Joi.string().required(),
  organization: Joi.object({
    name: Joi.string().required(),
    website: Joi.string().optional().allow(''),
    vat: Joi.string().optional().allow(''),
  }).required(),
  settings: Joi.object({
    portalName: Joi.string().optional().allow(''),
    clientName: Joi.string().optional().allow(''),
  }).optional(),
})

/**
 * Password validation.
 * @param {string} password
 */
const validatePassword = (password) => {
  const complexity = {
    min: 12,
    max: 200,
    lowerCase: 1,
    upperCase: 1,
    symbols: 1,
  }

  const errors = []

  const lower = password.match(/[a-z]/g)
  const upper = password.match(/[A-Z]/g)
  const symbol = password.match(/[^a-zA-Z0-9]/g)

  if (password.length < (complexity.min || 0)) errors.push(`Password must have at least ${complexity.min} characters`)
  if (password.length > (complexity.max || 200)) errors.push(`Password must have a maximum of ${complexity.max} characters`)
  if (!lower || lower.length < (complexity.lowerCase || 0)) errors.push(`Password must have at least ${complexity.lowerCase} lower case characters`)
  if (!upper || upper.length < (complexity.upperCase || 0)) errors.push(`Password must have at least ${complexity.upperCase} upper case characters`)
  if (!symbol || symbol.length < (complexity.symbols || 0)) errors.push(`Password must have at least ${complexity.symbols} symbols`)

  return {
    valid: !errors.length,
    errors,
  }
}

const registerBodyExtraValidator = (body) => {
  const res = validatePassword(body.password)
  return { errors: res.errors }
}

const changePasswordBodyExtraValidator = (body) => {
  const res = validatePassword(body.new_password)
  return { errors: res.errors }
}

const userProfileSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().optional().allow('', null),
  avatar: Joi.string().optional().allow('', null),
  mobile: Joi.string().optional().allow('', null),
})

const newAPITokenSchema = Joi.object({
  name: Joi.string().required(),
})

module.exports = {
  userSchema,
  validatePassword,
  validateRegisterBody: validator(userSchema, 'body', registerBodyExtraValidator),
  deprecatedValidateProfileUpdateBody: validator(deprecatedUserProfileSchema),
  validateProfileUpdateBody: validator(userProfileSchema),
  validateChangePasswordBody: validator(userChangePasswordSchema, 'body', changePasswordBodyExtraValidator),
  validateSetupBody: validator(userSetupSchema),
  validateNewAPITokenBody: validator(newAPITokenSchema),
}
