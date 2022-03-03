const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')
const log = require('../util/logger')

const get = async (req, res) => {
  const types = await models.AppType.findAll()
  return res.status(HTTPStatus.OK).send(types)
}

const post = async (req, res) => {
  const createdAppType = await models.AppType.create({
    type: req.body.type,
  })

  if (!createdAppType) {
    log.error('[CREATE APP TYPE]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Create App Type'] })
  }

  return res.status(HTTPStatus.CREATED).send(createdAppType)
}

const postStatus = async (req, res) => {
  const transaction = await sequelize.transaction()
  const data = await models.AppType.findByPk(req.body.type, {
    transaction,
  })
  if (data.id) {
    const [rowsUpdated, [updated]] = await models.AppType.update({ enabled: req.body.enabled }, {
      returning: true,
      where: {
        id: data.id,
      },
      transaction,
    })
    if (!rowsUpdated) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App Type not found'] })
    }
    await transaction.commit()
    return res.status(HTTPStatus.OK).send(updated)
  }
  return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App Type not found'] })
}

const deleteType = async (req, res) => {
  await models.AppType.destroy({
    where: {
      type: req.body.type,
    },
  })

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  get,
  post,
  deleteType,
  postStatus,
}
