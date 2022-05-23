const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const media = require('./media')
const requestProxy = require('express-request-proxy')

const {
  models,
  sequelize,
} = require('../models')
const config = require('../config')

function pathParser (mediaUrl, offset) {
  return mediaUrl.substr(mediaUrl.indexOf('/resources') + offset, mediaUrl.length)
}

const uploadResources = async (req, res) => {
  if (!req.formdata || !req.formdata.files) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['no files uploaded'] })
  }
  const organization = await models.Organization.getOwnerOrganization()
  const result = await media.saveFiles('resources', organization.id, req.formdata.files)
  if (result.httpCode !== HTTPStatus.OK) {
    return res.status(result.httpCode).send(result.payload)
  }
  const response = {
    savedObjects: [],
  }
  const saveResults = result.payload.saveResults
  const files = result.payload.files
  const transaction = await sequelize.transaction()
  try {
    for (let j = 0; j < saveResults.length; j++) {
      const sr = saveResults[j]
      if (sr.objectURL && sr.objectURL.length) {
        const file = pathParser(sr.objectURL, 7)
        const dataObject = {
          file: file,
          url: sr.objectURL,
          namespace: req.formdata.fields.namespace,
          language: req.formdata.fields.language || 'en-US',
          orgId: organization.id,
        }
        response.savedObjects.push(dataObject)
        await models.Resource.create(dataObject, { transaction })
      } else {
        if (!response.errors) response.errors = []
        response.errors.push({
          file: files[j].originalFilename,
          error: 'failed to save image',
        })
      }
    }
    await transaction.commit()
    return res.status(HTTPStatus.OK).send(response)
  } catch (error) {
    await transaction.rollback()
    log.error(error, '[UPLOAD RESOURCE]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to upload resource objects.'] })
  }
}

const defaultResources = {
  'dashboard.background': `${config.get('apiURL')}/media/Background.jpg`,
  'main.background': `${config.get('apiURL')}/media/Background.jpg`,
  'slider.background': `${config.get('apiURL')}/media/Background2.jpg`,
  'main.carousel1': `${config.get('apiURL')}/media/Home_Slider_1.png`,
  'main.carousel2': `${config.get('apiURL')}/media/Home_Slider_2.png`,
  'main.carousel3': `${config.get('apiURL')}/media/Home_Slider_3.png`,
  'marketplace.background': `${config.get('apiURL')}/media/Background.jpg`,
  'marketplace.hero': `${config.get('apiURL')}/media/Marketplace_hero.png`,
  'marketplace.apps': `${config.get('apiURL')}/media/marketplaceApps.svg`,
}

const getResources = async (req, res, next) => {
  try {
    const organization = await models.Organization.getOwnerOrganization()
    if (organization) {
      const resource = await models.Resource.findByNamespace(organization.id, req.params.namespace, req.query.language)
      if (resource) {
        const proxy = requestProxy({ url: resource.url })
        proxy(req, res, next)
      }
    }
    if (defaultResources[req.params.namespace]) {
      const proxy = requestProxy({ url: defaultResources[req.params.namespace] })
      proxy(req, res, next)
    } else if (defaultResources[req.params.namespace]) {
      const proxy = requestProxy({ url: defaultResources[req.params.namespace] })
      proxy(req, res, next)
    } else {
      return res.status(HTTPStatus.NOT_FOUND).send('resource not found')
    }
  } catch (e) {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send('resource not found')
  }
}

module.exports = {
  uploadResources,
  getResources,
}
