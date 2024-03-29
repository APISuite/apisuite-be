const validate = require('validate-image-type')
const HTTPStatus = require('http-status-codes')
const fs = require('fs').promises
const log = require('../util/logger')
const { v4: uuidv4 } = require('uuid')
const {
  models,
  sequelize,
} = require('../models')
const Storage = require('../services/storage')

function pathParser (mediaUrl, offset) {
  return mediaUrl.substr(mediaUrl.indexOf('/media') + offset, mediaUrl.length)
}

const validImageTypes = [
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/svg+xml',
  'image/webp',
]

const saveFiles = async (prefix, orgId, uploadedFiles) => {
  const files = []
  const badTypes = []
  for (const key in uploadedFiles) {
    if (key === '') return { httpCode: HTTPStatus.BAD_REQUEST, payload: { errors: ['Add key for each file of the request'] } }
    const file = uploadedFiles[key]
    const result = validate.validateMIMEType(file.filepath, {
      allowMimeTypes: validImageTypes,
    })
    if (!result.ok) {
      badTypes.push(file.originalFilename)
      continue
    }
    files.push(file)
  }

  if (badTypes.length) {
    return {
      httpCode: HTTPStatus.BAD_REQUEST,
      payload: {
        errors: badTypes.map((f) => ({
          file: f,
          error: 'invalid type (image expected)',
        })),
      },
    }
  }

  const storageClient = Storage.getStorageClient()
  const savePromises = files.map((f) => {
    const extension = f.originalFilename.split('.').pop()
    return storageClient.saveFile(f.filepath, `${prefix}-${orgId}-${uuidv4()}.${extension}`)
  })
  const saveResults = await Promise.all(savePromises)

  try {
    await Promise.all(files.map((f) => fs.unlink(f.filepath)))
  } catch (err) {
    log.error(err, 'uploadFile: failed to remove temporary files')
    return {
      httpCode: HTTPStatus.INTERNAL_SERVER_ERROR,
      payload: 'uploadFile: failed to remove temporary files',
    }
  }
  return {
    httpCode: HTTPStatus.OK,
    payload: { saveResults: saveResults, files: files },
  }
}

const uploadMedia = async (req, res) => {
  if (!req.formdata || !req.formdata.files) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['no files uploaded'] })
  }
  const result = await saveFiles('media', req.params.orgId, req.formdata.files)

  if (result.httpCode !== HTTPStatus.OK) {
    return res.status(result.httpCode).send(result.payload)
  }
  const saveResults = result.payload.saveResults
  const files = result.payload.files

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
          url: sr.objectURL,
        })
        await models.Media.create({
          file: file,
          url: sr.objectURL,
          orgId: req.params.orgId,
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

const deleteMedia = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const file = pathParser(req.query.mediaURL, 7)
    const mediaSearch = await models.Media.findByPk(file, { transaction })

    if (!mediaSearch) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Image not found'] })
    }

    const path = pathParser(req.query.mediaURL, 0)

    await models.Media.destroy({
      where: {
        file: file,
        orgId: req.params.orgId,
      },
      transaction,
    })

    const storageClient = Storage.getStorageClient()
    await storageClient.deleteFile(path)

    await transaction.commit()

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    await transaction.rollback()
    log.error(error, '[DELETE MEDIA]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to delete media object.'] })
  }
}

module.exports = {
  uploadMedia,
  deleteMedia,
  saveFiles,
}
