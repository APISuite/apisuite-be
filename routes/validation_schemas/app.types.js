const Joi = require('joi')
const validator = require('./validator')
const { regex } = require('../../util/enums')

const appTypes = Joi.object({
  type: Joi.string().required(),
})

module.exports = {
  validateAppTypeBody: validator(appTypes),
}
