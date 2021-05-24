const HTTPStatus = require('http-status-codes')
const { models } = require('../models')

const get = async (req, res) => {
  const tr = await models.Translation.findByPk(req.params.locale)
  if (!tr) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['translation not found'] })
  }

  return res.status(HTTPStatus.OK).send(tr.translations)
}

const upsert = async (req, res) => {
  let tr = await models.Translation.findByPk(req.params.locale)

  if (!tr) {
    tr = await models.Translation.create({
      locale: req.params.locale,
      translations: req.body,
    }, {
      returning: true,
    })
    return res.status(HTTPStatus.OK).send(tr.translations)
  }

  tr.translations = req.body
  tr = await tr.save({ returning: true })

  return res.status(HTTPStatus.OK).send(tr.values)
}

module.exports = {
  get,
  upsert,
}
