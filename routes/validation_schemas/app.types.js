const Joi = require('joi')
const validator = require('./validator')

const appTypes = Joi.object({
  type: Joi.string().required(),
})

module.exports = {
  validateAppTypeBody: validator(appTypes),
}
