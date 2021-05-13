const Joi = require('joi')
const validator = require('./validator')
const { validatePassword } = require('./user.schema')

const signupSchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
})

const signupBodyExtraValidator = (body) => {
  const res = validatePassword(body.password)
  return { errors: res.errors }
}

module.exports = {
  validateSignupBody: validator(signupSchema, 'body', signupBodyExtraValidator),
}
