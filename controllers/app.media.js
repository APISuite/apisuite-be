const HTTPStatus = require('http-status-codes')
const fs = require('fs').promises
const log = require('../util/logger')
const { v4: uuidv4 } = require('uuid')
const { models } = require('../models')
const Storage = require('../services/storage')

const uploadMedia = async (req, res) => {
  if (!req.formdata || !req.formdata.files) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['no files uploaded'] })
  }

  const files = []
  const badTypes = []
  for (const key in req.formdata.files) {
    const file = req.formdata.files[key]
    if (file.type.split('/')[0] !== 'image') {
      badTypes.push(file.name)
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

  const app = await models.App.findOne({
    where: {
      id: req.params.id,
      org_id: req.user.org.id,
      enable: true,
    },
  })

  if (!app) return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })

  const storageClient = Storage.getStorageClient()
  const savePromises = files.map((f) => {
    const extension = f.name.split('.').pop()
    return storageClient.saveFile(f.path, `app-media-${req.params.id}-${uuidv4()}.${extension}`)
  })
  const saveResults = await Promise.all(savePromises)

  try {
    await Promise.all(files.map((f) => fs.unlink(f.path)))
  } catch (err) {
    log.error(err, 'uploadMedia: failed to remove temporary files')
  }

  const response = {
    savedImages: [],
    errors: [],
  }
  const imageURLs = []

  for (let i = 0; i < saveResults.length; i++) {
    const sr = saveResults[i]
    if (sr.objectURL && sr.objectURL.length) {
      imageURLs.push(sr.objectURL)
      response.savedImages.push({
        file: files[i].name,
        url: sr.objectURL,
      })
      continue
    }

    response.errors.push({
      file: files[i].name,
      error: 'failed to save image',
    })
  }

  app.images = app.images.concat(imageURLs)
  await app.save()

  if (!response.errors.length) delete response.errors

  return res.status(HTTPStatus.OK).send(response)
}

const deleteMedia = async (req, res) => {
  const app = await models.App.findOne({
    where: {
      id: req.params.id,
      org_id: req.user.org.id,
      enable: true,
    },
  })

  if (!app) return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['App not found'] })

  const storageClient = Storage.getStorageClient()
  await storageClient.deleteFile(req.query.mediaURL)

  app.images = app.images.filter((img) => img !== req.query.mediaURL)
  await app.save()

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  uploadMedia,
  deleteMedia,
}
