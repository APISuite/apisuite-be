const HTTPStatus = require('http-status-codes')
const { Op } = require('sequelize')
const { models, sequelize } = require('../models')

const publicAppAttributes = [
  'id',
  'name',
  'description',
  'shortDescription',
  'logo',
  'labels',
  'tosUrl',
  'images',
  'privacyUrl',
  'youtubeUrl',
  'websiteUrl',
  'supportUrl',
  'directUrl',
  'createdAt',
  'updatedAt',
  ['org_id', 'orgId'],
]

const publicAppOrgAttributes = [
  'id',
  'name',
  'tosUrl',
  'privacyUrl',
  'supportUrl',
]

const includes = () => [
  {
    model: models.Organization,
    attributes: publicAppOrgAttributes,
  },
  {
    model: models.AppType,
    attributes: ['id', 'type', 'createdAt', 'updatedAt'],
  },
]

const listPublicApps = async (req, res) => {
  const filters = {
    visibility: 'public',
    enable: true,
  }

  if (req.query.metadata_key && req.query.metadata_value && res.locals.isAdmin) {
    const appMetadata = await models.AppMetadata.findAll({
      where: {
        key: req.query.metadata_key,
        value: req.query.metadata_value,
      },
      attributes: ['appId'],
    })

    if (appMetadata) {
      filters.id = appMetadata.map((am) => am.appId)
    }
  }

  if (req.query.org_id) {
    filters.org_id = {
      [Op.in]: Array.isArray(req.query.org_id) ? req.query.org_id : [req.query.org_id],
    }
  }

  if (req.query.label) {
    filters.labels = {
      [Op.overlap]: Array.isArray(req.query.label) ? req.query.label : [req.query.label],
    }
  }

  let search = {}
  const replacements = []
  if (req.query.search && typeof req.query.search === 'string') {
    const matchSearch = `%${req.query.search}%`
    search = {
      [Op.or]: [
        { name: { [Op.iLike]: matchSearch } },
        { '$organization.name$': { [Op.iLike]: matchSearch } },
        sequelize.literal('EXISTS (SELECT * FROM unnest(labels) AS label WHERE label ILIKE ?)'),
      ],
    }
    replacements.push(matchSearch)
  }

  let order = []
  const sortOrder = req.query.order || 'asc'
  switch (req.query.sort_by) {
    case 'updated': {
      order = [
        ['updated_at', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    case 'org': {
      order = [
        [models.Organization, 'name', sortOrder],
        ['name', sortOrder],
      ]
      break
    }
    default: {
      order = [['name', sortOrder]]
      break
    }
  }

  const queryOptions = {
    where: { ...filters, ...search },
    include: includes(),
    attributes: publicAppAttributes,
    replacements,
    order,
  }

  const apps = await models.App.findAllPaginated({
    page: req.query.page,
    pageSize: req.query.pageSize,
    options: queryOptions,
  })

  return res.status(HTTPStatus.OK).json(apps)
}

const listPublicLabels = async (req, res) => {
  // const sql = `
  //   SELECT DISTINCT unnest(labels) AS label
  //   FROM app
  //   WHERE visibility = 'public'
  //   AND enable = true
  //   AND state = 'approved'
  // ORDER BY label`
  // const labels = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })

  const labels = await models.App.findAll({
    attributes: [
      [
        sequelize.fn('distinct',
          sequelize.fn('unnest',
            sequelize.literal('labels'),
          ),
        ), 'label'],
    ],
    raw: true,
    where: {
      visibility: 'public',
      enable: true,
    },
    order: [[sequelize.literal('label')]],
  })

  return res.status(HTTPStatus.OK).json(labels.map((l) => l.label))
}

const publicAppDetails = async (req, res) => {
  const app = await models.App.findOne({
    where: {
      id: req.params.id,
      visibility: 'public',
      enable: true,
    },

    include: includes(),
  })

  if (!app) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })
  }

  return res.status(HTTPStatus.OK).json(app)
}

module.exports = {
  listPublicApps,
  listPublicLabels,
  publicAppDetails,
}
