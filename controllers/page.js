const HTTPStatus = require('http-status-codes')
const { models } = require('../models')

const list = async (req, res) => {
  const pages = await models.Page.findAll({
    attributes: ['id', 'locale', 'title', 'online', 'parent', 'createdAt', 'updatedAt'],
  })
  return res.status(HTTPStatus.OK).send(pages)
}

const get = async (req, res) => {
  const page = await models.Page.findOne({
    where: {
      id: req.params.id,
      locale: req.params.locale,
    },
  })
  if (!page) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Page not found'] })
  }
  return res.status(HTTPStatus.OK).send(page)
}

const create = async (req, res) => {
  if (!res.locals.isAdmin) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['You are not allowed to perform this action.'] })
  }

  let page = await models.Page.findOne({
    where: {
      id: req.body.id,
      locale: req.body.locale,
    },
  })
  if (page) {
    return res.status(HTTPStatus.CONFLICT).send({ errors: ['Page ID already in use'] })
  }

  page = await models.Page.create({
    id: req.body.id,
    locale: req.body.locale,
    content: req.body.content,
    online: req.body.online,
    title: req.body.title,
  })

  return res.status(HTTPStatus.CREATED).send(page)
}

const update = async (req, res) => {
  if (!res.locals.isAdmin) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['You are not allowed to perform this action.'] })
  }

  let page = await models.Page.findOne({
    where: {
      id: req.params.id,
      locale: req.body.locale,
    },
  })
  if (!page) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Page not found'] })
  }

  page.content = req.body.content
  page.title = req.body.title
  page.online = req.body.online
  page.parent = req.body.parent
  page = await page.save({ returning: true })

  return res.status(HTTPStatus.OK).send(page)
}

const deletePage = async (req, res) => {
  if (!res.locals.isAdmin) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['You are not allowed to perform this action.'] })
  }

  const page = await models.Page.findOne({
    where: {
      id: req.params.id,
      locale: req.params.locale,
    },
  })
  if (page) await page.destroy()

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  list,
  get,
  create,
  update,
  deletePage,
}
