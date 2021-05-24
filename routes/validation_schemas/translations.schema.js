const { validateLocaleCode } = require('iso-lang-codes')
const validator = require('./validator')
const Joi = require('joi')

const localeParamSchema = Joi.object({
  locale: Joi.string().required(),
})

const localeParamExtraValidation = (params) => ({
  errors: validateLocaleCode(params.locale) ? [] : ['invalid locale code'],
})

module.exports = {
  validateLocaleParam: validator(localeParamSchema, 'params', localeParamExtraValidation),
}
