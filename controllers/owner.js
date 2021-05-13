const HTTPStatus = require('http-status-codes')
const { models } = require('../models')

const get = async (req, res) => {
  const org = await models.Organization.getOwnerOrganization()
  if (!org) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Owner organization does not exist.'] })
  }

  return res.status(HTTPStatus.OK).send(org)
}

module.exports = {
  get,
}
