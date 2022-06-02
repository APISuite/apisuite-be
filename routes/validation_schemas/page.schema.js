const Joi = require('joi')
const { validateLocaleCode } = require('iso-lang-codes')
const validator = require('./validator')
const { regex } = require('../../util/enums')

const pagePayloadSchema = Joi.object({
  id: Joi.string().required().custom((value, helpers) => {
    if (!regex.SNAKE_CASE.test(value)) return helpers.message('ID must be snake_case')
    return true
  }),
  locale: Joi.string().required().custom((value, helpers) => {
    if (!validateLocaleCode(value)) return helpers.message('invalid locale format')
    return true
  }),
  title: Joi.string(),
  content: Joi.string().optional(),
  online: Joi.bool(),
  parent: Joi.string().optional(),
})

module.exports = {
  validatePagePayload: validator(pagePayloadSchema),
}
