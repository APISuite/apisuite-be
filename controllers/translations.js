const HTTPStatus = require('http-status-codes')
const { models } = require('../models')

const get = async (req, res) => {
  const tr = await models.Translation.findByLanguageExtension(req.params.locale, req.params.extension)
  if (!tr) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['translation not found'] })
  }

  return res.status(HTTPStatus.OK).send(tr.translations)
}

const upsert = async (req, res) => {
  let tr = await models.Translation.findByLanguageExtension(req.params.locale, req.params.extension)

  if (!tr) {
    tr = await models.Translation.create({
      locale: req.params.locale,
      translations: req.body,
      extension: req.params.extension,
    }, {
      returning: true,
    })
    return res.status(HTTPStatus.OK).send(tr.translations)
  }

  tr = await tr.update(
    { translations: req.body },
    {
      where: {
        locale: req.params.locale,
        extension: req.params.extension,
      },
    })

  return res.status(HTTPStatus.OK).send(tr.values)
}

module.exports = {
  get,
  upsert,
}
