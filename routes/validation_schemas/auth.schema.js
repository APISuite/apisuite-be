const Joi = require('joi')
const validator = require('./validator')
const { validatePassword } = require('./user.schema')

const emailSchema = Joi.string().email().required()

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
})

const recoverPasswordSchema = Joi.object({
  token: Joi.string().guid({ version: 'uuidv4' }).required(),
  password: Joi.string().required(),
})

const recoverPasswordExtraValidator = (body) => {
  const res = validatePassword(body.password)
  return { errors: res.errors }
}

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
})

const providerSchema = Joi.object({
  provider: Joi.string().valid('keycloak').required(),
})

const stateSchema = Joi.object({
  state: Joi.string().min(10).max(15).required(),
})

const codeSchema = Joi.object({
  code: Joi.string().required(),
})

module.exports = {
  validateForgotPasswordBody: validator(forgotPasswordSchema),
  validateRecoverPasswordBody: validator(recoverPasswordSchema, 'body', recoverPasswordExtraValidator),
  validateLoginBody: validator(loginSchema),
  validateProvider: validator(providerSchema, 'params'),
  validateState: validator(stateSchema, 'query'),
  validateCode: validator(codeSchema),
}
