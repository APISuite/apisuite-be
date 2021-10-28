const fs = require('fs').promises
const HTTPStatus = require('http-status-codes')
const { Op } = require('sequelize')
const log = require('../util/logger')
const { models, sequelize } = require('../models')
const swaggerUtil = require('../util/swagger_util')
const Gateway = require('../services/gateway')
const { apiTypes } = require('../util/enums')
const { createAPIHandler } = require('./api-helper')

const getAll = async (req, res) => {
  const filters = {}
  if (req.query.type) {
    filters.type = {
      [Op.overlap]: Array.isArray(req.query.type) ? req.query.type : [req.query.type],
    }
  }

  let search = {}
  let matchSearch = ''
  if (req.query.search && typeof req.query.search === 'string') {
    matchSearch = `%${req.query.search}%`
    search = {
      [Op.or]:
        [
          { name: { [Op.iLike]: matchSearch } },
          sequelize.literal('?.?::TEXT ILIKE ?'),
        ],
    }
  }

  let order = []
  const sortOrder = req.query.order || 'asc'
  switch (req.query.sort_by) {
    case 'published': {
      order = [
        ['published_at', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    case 'created': {
      order = [
        ['created_at', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    case 'updated': {
      order = [
        ['updated_at', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    default: {
      order = [['name', sortOrder]]
      break
    }
  }

  try {
    const options = {
      where: {
        ...search,
        ...filters,
      },
      distinct: true,
      include: [{
        model: models.ApiVersion,
        attributes: {
          exclude: ['spec'],
        },
      }],
      replacements: ['apis', 'type', matchSearch],
      order,
    }

    if (res.locals.isAdmin) {
      delete options.where
    }

    const apis = await models.Api.findAllPaginated({
      page: req.query.page,
      pageSize: req.query.pageSize,
      options,
    })
    return res.status(HTTPStatus.OK).send(apis)
  } catch (error) {
    log.error(error, '[API getAll]')
    return res.sendInternalError()
  }
}

const getById = async (req, res) => {
  try {
    const options = {
      where: {
        id: req.params.id,
        publishedAt: { [Op.not]: null },
      },
      include: [{
        model: models.ApiVersion,
      }],
      order: [
        [models.ApiVersion, 'created_at', 'DESC'],
      ],
    }

    if (res.locals.isAdmin) {
      delete options.where.publishedAt
    }

    const api = await models.Api.findOne(options)

    if (!api) {
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API with inputed id does not exist.'] })
    }
    return res.status(HTTPStatus.OK).send(api)
  } catch (error) {
    log.error(error, '[GET API BY ID]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to get API.'] })
  }
}

const createAPI = async (req, res) => {
  req.body.type = apiTypes.CLOUD
  const apiRes = await createAPIHandler(req.body)

  if (apiRes.status !== HTTPStatus.CREATED) {
    return res.status(apiRes.status).send({ errors: apiRes.errors })
  }

  // TODO create gateway service and configure for subscriptions
  // try {
  //   const gateway = await Gateway()
  //   await gateway.configureGatewaySubscription(apiRes.api.name, apiRes.api.id)
  // } catch (error) {
  //   log.error('[createAPI] => configureGatewaySubscription', error)
  // }

  return res.status(apiRes.status).send(apiRes.api)
}

const updateAPI = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const versions = req.body.versions || []
    delete req.body.versions

    const [rowsUpdated] = await models.Api.update(
      req.body,
      {
        where: { id: req.params.id },
        returning: true,
        transaction,
      },
    )

    if (!rowsUpdated) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API not found'] })
    }

    const versionUpdates = []
    const versionDeletes = []
    for (const version of versions) {
      if (version.deleted) {
        versionDeletes.push(
          models.ApiVersion.destroy({
            where: { id: version.id },
            transaction,
          }),
        )

        continue
      }

      versionUpdates.push(
        models.ApiVersion.update(
          {
            live: version.live,
            deprecated: version.deprecated,
          },
          {
            where: { id: version.id },
            transaction,
          },
        ),
      )
    }

    await Promise.all(versionUpdates)
    await Promise.all(versionDeletes)

    await transaction.commit()

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    await transaction.rollback()
    log.error(error, '[UPDATE API]')
    return res.sendInternalError()
  }
}

const deleteAPI = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const api = await models.Api.findByPk(req.params.id, { transaction })
    if (!api) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API does not exist.'] })
    }

    const apps = await api.getSubscriptions({ transaction })
    const appIds = apps.length ? apps.map(s => s.id) : []
    await api.removeSubscriptions(appIds, { transaction })

    try {
      const gateway = await Gateway()
      for (const id of appIds) {
        await gateway.unsubscribeFromAPI(id, api.id)
      }
    } catch (error) {
      log.error('[deleteAPI] => unsubscribeFromAPI', error)
    }

    await api.destroy({ transaction })
    await transaction.commit()

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    await transaction.rollback()
    log.error(error, '[DELETE API]')
    return res.sendInternalError()
  }
}

const createAPIversion = async (req, res) => {
  if (!req.formdata || !req.formdata.files || !req.formdata.files.file) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['File was not uploaded.'] })
  }

  const validationRes = await swaggerUtil.validateSwagger(req.formdata.files.file.path)
  if (validationRes.errors.length) {
    log.info(validationRes.errors, '[CREATE API version valitationRes ERR]')
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: [...validationRes.errors] })
  }

  const api = await models.Api.findByPk(req.params.apiId)

  if (!api) {
    log.info(`API "${req.params.apiId}" not found`)
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API not found'] })
  }

  const jsonFile = await fs.readFile(req.formdata.files.file.path)
  const parsedAPI = JSON.parse(jsonFile)

  const apiVersion = await models.ApiVersion.create({
    title: validationRes.api.info.title,
    version: validationRes.api.info.version,
    apiId: api.dataValues.id,
    spec: parsedAPI,
  })

  return res.status(HTTPStatus.CREATED).send(apiVersion)
}

const getVersionById = async (req, res) => {
  const apiVersion = await models.ApiVersion.findOne({
    where: {
      id: req.params.id,
      apiId: req.params.apiId,
    },
  })

  if (!apiVersion) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API not found'] })
  }

  return res.status(HTTPStatus.OK).send(apiVersion)
}

const updateAPIversion = async (req, res) => {
  try {
    const [rowsUpdated, [updated]] = await models.ApiVersion.update(
      req.body,
      {
        where: {
          id: req.params.id,
          apiId: req.params.apiId,
        },
        returning: true,
      },
    )

    if (!rowsUpdated) {
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API version not found'] })
    }

    return res.status(HTTPStatus.OK).send(updated)
  } catch (err) {
    log.error(err, '[UPDATE API version]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update the API version'] })
  }
}

const setPublished = (published) => {
  return async (req, res) => {
    try {
      const [rowsUpdated] = await models.Api.update(
        { publishedAt: published ? new Date() : null },
        {
          where: { id: req.params.id },
          returning: true,
        },
      )

      if (!rowsUpdated) {
        return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['API not found'] })
      }

      return res.sendStatus(HTTPStatus.NO_CONTENT)
    } catch (err) {
      log.error(err, '[UPDATE API]')
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update the API'] })
    }
  }
}

module.exports = {
  getAll,
  getById,
  createAPI,
  updateAPI,
  deleteAPI,
  createAPIversion,
  getVersionById,
  updateAPIversion,
  setPublished,
}
