const pino = require('pino')

const logger = pino({
  name: 'APISuite-API',
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
})

module.exports = logger
