const HTTPStatus = require('http-status-codes')
const { sequelize } = require('../models')
const { checkConnection } = require('../services/msg-broker')

const healthCheck = async (req, res, next) => {
  try {
    await sequelize.query('SELECT now();', { type: sequelize.QueryTypes.SELECT })
  } catch (err) {
    return next(err)
  }

  return res.status(HTTPStatus.OK).json({
    status: 'ok',
    time: new Date().toISOString(),
    messageBroker: checkConnection() ? 'ok' : 'nok',
  })
}

module.exports = {
  healthCheck,
}
