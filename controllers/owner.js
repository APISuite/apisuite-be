const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')

const get = async (req, res) => {
  const ownerOrg = await sequelize.query('SELECT organization_id FROM owner_organization', { type: sequelize.QueryTypes.SELECT })
  if (!ownerOrg || ownerOrg.length !== 1) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Owner organization does not exist.'] })
  }

  const org = await models.Organization.findByPk(ownerOrg[0].organization_id)

  return res.status(HTTPStatus.OK).send(org)
}

module.exports = {
  get,
}
