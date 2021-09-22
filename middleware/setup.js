const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const { sequelize } = require('../models')

module.exports = async (req, res, next) => {
  const token = req.get('x-setup-token')

  if (!token) {
    log.info(`Address (${req.ip}) trying to use protected setup endpoint.`, '[checkSetupToken]')
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Invalid token.'] })
  }

  const [, rowsAffected] = await sequelize.query(`
      UPDATE setup_token SET used = true
      WHERE token = ? AND used = false;
    `, { replacements: [token] })

  if (!rowsAffected) return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Invalid token.'] })

  next()
}
