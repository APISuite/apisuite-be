const HTTPStatus = require('http-status-codes')
const FileType = require('file-type')
const fs = require('fs').promises
const log = require('../util/logger')
const { v4: uuidv4 } = require('uuid')
const requestProxy = require('express-request-proxy');

const {
  models,
  sequelize,
} = require('../models')
const Storage = require('../services/storage')

const validImageExts = new Set([
  'jpg',
  'png',
  'gif',
  'webp',
])

function pathParser (mediaUrl, offset) {
  return mediaUrl.substr(mediaUrl.indexOf('/resources') + offset, mediaUrl.length)
}

const uploadResources = async (req, res) => {
  if (!req.formdata || !req.formdata.files) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['no files uploaded'] })
  }

  const files = []
  const badTypes = []
  for (const key in req.formdata.files) {
    if (key === '') return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Add key for each file of the request'] })
    const file = req.formdata.files[key]
    const type = await FileType.fromFile(file.filepath)
    if (!type || !validImageExts.has(type.ext)) {
      badTypes.push(file.originalFilename)
      continue
    }
    files.push(file)
  }

  if (badTypes.length) {
    return res.status(HTTPStatus.BAD_REQUEST).send({
      errors: badTypes.map((f) => ({
        file: f,
        error: 'invalid type (image expected)',
      })),
    })
  }

  const storageClient = Storage.getStorageClient()
  const organization = await models.Organization.getOwnerOrganization()
  const savePromises = files.map((f) => {
    const extension = f.originalFilename.split('.').pop()
    return storageClient.saveFile(f.filepath, `resources-${organization.id}-${uuidv4()}.${extension}`)
  })
  const saveResults = await Promise.all(savePromises)

  try {
    await Promise.all(files.map((f) => fs.unlink(f.filepath)))
  } catch (err) {
    log.error(err, 'uploadMedia: failed to remove temporary files')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send('uploadMedia: failed to remove temporary files')
  }

  const response = {
    savedObjects: [],
    errors: [],
  }

  const transaction = await sequelize.transaction()
  try {
    for (let j = 0; j < saveResults.length; j++) {
      const sr = saveResults[j]
      if (sr.objectURL && sr.objectURL.length) {
        const file = pathParser(sr.objectURL, 7)
        response.savedObjects.push({
          file: files[j].originalFilename,
          namespace: req.formdata.fields.namespace,
          url: sr.objectURL,
          language: req.formdata.fields.language || 'en-US',
          orgId: organization.id,
        })
        await models.Resource.create({
          file: file,
          url: sr.objectURL,
          namespace: req.formdata.fields.namespace,
          language: req.formdata.fields.language || 'en-US',
          orgId: organization.id,
        }, { transaction })
        continue
      }

      response.errors.push({
        file: files[j].originalFilename,
        error: 'failed to save image',
      })
    }

    await transaction.commit()

    if (!response.errors.length) delete response.errors
    return res.status(HTTPStatus.OK).send(response)
  } catch (error) {
    await transaction.rollback()
    log.error(error, '[UPLOAD MEDIA]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to upload media objects.'] })
  }
}

const getResources = async (req, res, next) => {
  try {
    const organization = await models.Organization.getOwnerOrganization()
    const resource = await models.Resource.findByNamespace(organization.id, req.params.namespace, req.query.language)
    if (resource) {
      const proxy = requestProxy({ url: resource.url })
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
