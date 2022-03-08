const Joi = require('joi')
const validator = require('./validator')

const appTypeStatus = Joi.object({
  type: Joi.number().required(),
  enabled: Joi.bool().required(),
})

module.exports = {
  validateAppTypeStatusBody: validator(appTypeStatus),
}
