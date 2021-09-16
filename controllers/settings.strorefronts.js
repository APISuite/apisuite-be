const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')
const log = require('../util/logger')


const get = async (req, res) => {

    const settings = await models.SettingsStoreFronts.findOne({
      where: { name: req.params.name },
    })

    if (settings)
      return res.status(HTTPStatus.OK).send(settings.dataValues.values)

      return res.status(HTTPStatus.NOT_FOUND).send({errors: ['Store does not exist.']})
}

module.exports = {
  get,
}
