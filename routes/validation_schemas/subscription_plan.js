const Joi = require('joi')

const newSubscriptionPlan = Joi.object({
  type: Joi.string().valid('starter').required(),
  plan: Joi.object().required(),
})

module.exports = {
  newSubscriptionPlan,
}
