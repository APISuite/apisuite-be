const HTTPStatus = require('http-status-codes')
const { models } = require('../models')

const list = async (req, res) => {
  const roles = await models.Role.findAll({
    attributes: ['name', 'id', 'level'],
  })

  return res.status(HTTPStatus.OK).send(roles)
}

const create = async (req, res) => {
  if (!res.locals.isAdmin) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['You are not allowed to perform this action.'] })
  }

  const role = await models.Role.create({
    name: req.body.name,
    level: 1000,
    grants: req.body.grants,
  })

  return res.status(HTTPStatus.CREATED).send(role)
}

module.exports = {
  list,
  create,
}
