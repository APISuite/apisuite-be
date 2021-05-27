const HTTPStatus = require('http-status-codes')
const crypto = require('crypto')
const { models } = require('../models')

const listAPITokens = async (req, res) => {
  const tokens = await models.APIToken.findAll({
    where: {
      user_id: req.user.id,
    },
    attributes: ['id', 'name', 'createdAt'],
  })

  return res.status(HTTPStatus.OK).send({ tokens })
}

const createAPIToken = async (req, res) => {
  const tokenValue = crypto.randomBytes(20).toString('hex')

  const token = await models.APIToken.create({
    name: req.body.name,
    token: tokenValue,
    userId: req.user.id,
  })

  token.token = `${token.id}_${tokenValue}`

  return res.status(HTTPStatus.CREATED).send({ token })
}

const revokeAPIToken = async (req, res) => {
  await models.APIToken.destroy({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  })

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  listAPITokens,
  createAPIToken,
  revokeAPIToken,
}
