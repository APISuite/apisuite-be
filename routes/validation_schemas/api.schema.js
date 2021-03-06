const Joi = require('joi')
const validator = require('./validator')

const apiDocsSchema = Joi.object({
  title: Joi.string().optional(),
  info: Joi.string().optional(),
  target: Joi.string().valid('product_intro', 'feature', 'use_case', 'highlight').required(),
  image: Joi.string().optional(),
})

const apiVersionPatchSchema = Joi.object({
  id: Joi.number().required(),
  live: Joi.boolean().required(),
  deprecated: Joi.boolean().required(),
  deleted: Joi.boolean().required(),
})

const APISchema = Joi.object({
  name: Joi.string().required(),
  baseUri: Joi.string().optional(),
  baseUriSandbox: Joi.string().optional(),
  docs: Joi.array().items(apiDocsSchema).optional(),
  versions: Joi.array().items(apiVersionPatchSchema).optional(),
})

const APIversionSchema = Joi.object({
  live: Joi.boolean().required(),
})

const apiPaginationSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).optional(),
})

module.exports = {
  validateAPIBody: validator(APISchema),
  validateAPIversionBody: validator(APIversionSchema, 'formdata.fields'),
  validateApiVersionPatchBody: validator(apiVersionPatchSchema),
  validateAPIPagination: validator(apiPaginationSchema, 'query'),
}
