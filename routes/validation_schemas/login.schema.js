const validator = require('./validator')
const Joi = require('joi')

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
})

module.exports = {
  validateLoginBody: validator(loginSchema),
}
