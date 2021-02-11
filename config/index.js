const convict = require('convict')
const schema = require('./schema')

module.exports = convict(schema)
