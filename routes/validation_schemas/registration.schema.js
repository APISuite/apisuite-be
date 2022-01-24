const Joi = require('joi')
const validator = require('./validator')

const userConfirmSchema = Joi.object({
  token: Joi.string().guid({ version: 'uuidv4' }).required(),
})

const registerSchema = Joi.object({
  user: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required().required(),
    password: Joi.string().required(),
  }).required(),
  organization: Joi.string().optional(),
  recaptchaToken: Joi.string().optional(),
})

module.exports = {
  validateUserConfirmBody: validator(userConfirmSchema),
  validateUserRegistrationInvitationBody: validator(userConfirmSchema),
  validateRegisterBody: validator(registerSchema),
}
