const validator = require('./validator')
const Joi = require('joi')

const inviteSchema = Joi.object({
  email: Joi.string().required(),
  role_id: Joi.string().required(),
}).options({
  allowUnknown: true,
})

module.exports = {
  validateInviteBody: validator(inviteSchema),
}
