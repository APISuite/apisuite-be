const Joi = require('joi')
const validator = require('./validator')

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().required(),
})

const userProfileSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().allow('', null).optional(),
  org_id: Joi.string().allow('', null),
  avatar: Joi.string().allow('', null),
  mobile: Joi.string().required(),
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
  }),
})

/**
 *
 * @param {*} pwd
 * @param {*} options
 */
const validatePassword = (pwd, options) => {
  const complexity = options || {
    min: 12,
    max: 200,
    lowerCase: 1,
    upperCase: 1,
    symbols: 1,
  }

  const errors = []

  const lower = pwd.match(/[a-z]/g)
  const upper = pwd.match(/[A-Z]/g)
  const symbol = pwd.match(/[^a-zA-Z0-9]/g)

  if (pwd.length < (complexity.min || 0)) errors.push(`Password must have at least ${complexity.min} characters`)
  if (pwd.length > (complexity.max || 200)) errors.push(`Password must have a maximum of ${complexity.max} characters`)
  if (!lower || lower.length < (complexity.lowerCase || 0)) errors.push(`Password must have at least ${complexity.lowerCase} lower case characters`)
  if (!upper || upper.length < (complexity.upperCase || 0)) errors.push(`Password must have at least ${complexity.upperCase} upper case characters`)
  if (!symbol || symbol.length < (complexity.symbols || 0)) errors.push(`Password must have at least ${complexity.symbols} symbols`)

  return {
    valid: !errors.length,
    error: errors,
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

module.exports = {
  userSchema,
  validatePassword,
  validateRegisterBody: validator(userSchema, 'body', registerBodyExtraValidator),
  validateProfileUpdateBody: validator(userProfileSchema),
  validateChangePasswordBody: validator(userChangePasswordSchema, 'body', changePasswordBodyExtraValidator),
  validateSetupBody: validator(userSetupSchema),
}
