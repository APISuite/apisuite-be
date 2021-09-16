const HTTPStatus = require('http-status-codes')
const { models } = require('../models')

const get = async (req, res) => {
  const settings = await models.SettingsStoreFronts.findOne({ where: { name: req.params.name } })

  if (!settings) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Name does not exist.'] })
  }
  return res.status(HTTPStatus.OK).send(settings.values)
}

module.exports = {
  get,
}
