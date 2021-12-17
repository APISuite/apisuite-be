const validator = require('./validator')
const Joi = require('joi')

const deleteQuery = Joi.object({
  mediaURL: Joi.string().required(),
})

module.exports = {
  validateDeleteQuery: validator(deleteQuery, 'query'),
}
