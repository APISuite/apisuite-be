const HTTPStatus = require('http-status-codes')
const fs = require('fs').promises
const log = require('../util/logger')
const { v4: uuidv4 } = require('uuid')
const {
  models,
  sequelize,
} = require('../models')
const Storage = require('../services/storage')

const uploadMedia = async (req, res) => {
  if (!req.formdata || !req.formdata.files) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['no files uploaded'] })
  }

  const files = []
  const badTypes = []
  for (const key in req.formdata.files['']) {
    const file = req.formdata.files[''][key]
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

  const storageClient = Storage.getStorageClient()
  const savePromises = files.map((f) => {
    const extension = f.name.split('.').pop()
    return storageClient.saveFile(f.path, `media-${req.params.orgId}-${uuidv4()}.${extension}`)
  })
  const saveResults = await Promise.all(savePromises)

  try {
    await Promise.all(files.map((f) => fs.unlink(f.path)))
  } catch (err) {
    log.error(err, 'uploadMedia: failed to remove temporary files')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send('uploadMedia: failed to remove temporary files')
  }

  const response = {
    savedImages: [],
    errors: [],
  }
  const imageURls = []
  const transaction = await sequelize.transaction()
  for (let j = 0; j < saveResults.length; j++) {
    const sr = saveResults[j]
    const file = sr.objectURL.substr(sr.objectURL.indexOf('/media/') + 7, sr.objectURL.length)
    if (sr.objectURL && sr.objectURL.length) {
      imageURls.push(sr.objectURL)
      response.savedImages.push({
        file: files[j].name,
        url: sr.objectURL,
      })
      await models.Media.create({
        file: file,
        url: sr.objectURL,
        orgId: req.params.orgId,
      }, transaction)
      continue
    }

    await transaction.commit()

    response.errors.push({
      file: files[j].name,
      error: 'failed to save image',
    })
  }

  if (!response.errors.length) delete response.errors
  return res.status(HTTPStatus.OK).send(response)
}

const deleteMedia = async (req, res) => {
  const transaction = await sequelize.transaction()

  const file = req.query.mediaUrl.substr(req.query.mediaUrl.indexOf('/media/') + 7, req.query.mediaUrl.length)
  const mediaSearch = await models.Media.findByPk(file, { transaction })

  if (!mediaSearch) return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Image not found'] })

  const path = req.query.mediaUrl.substr(req.query.mediaUrl.indexOf('/media'), req.query.mediaUrl.length)

  await models.Media.destroy({
    where: {
      file: file,
      orgId: req.params.orgId,
    },
    transaction,
  })
  await transaction.commit()

  const storageClient = Storage.getStorageClient()
  await storageClient.deleteFile(path)

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  uploadMedia,
  deleteMedia,
}
