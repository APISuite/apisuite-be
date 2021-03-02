const validator = require('./validator')
const Joi = require('joi')

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
})

const lastLoginSchema = Joi.object({
  user_id: Joi.number().integer().required(),
})

module.exports = {
  validateLoginBody: validator(loginSchema),
  validateLastLoginBody: validator(lastLoginSchema),
}
