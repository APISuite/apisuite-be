const fs = require('fs').promises
const HTTPStatus = require('http-status-codes')
const Storage = require('../services/storage')

const upload = async (req, res) => {
  if (!req.formdata || !req.formdata.files || !req.formdata.files.mediaFile) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['File was not uploaded.'] })
  }

  const file = req.formdata.files.mediaFile
  const storageClient = Storage.getStorageClient()
  const uploaded = await storageClient.saveFile(file.path, file.name)
  if (uploaded.error) {
    return res.sendInternalError()
  }

  await fs.unlink(file.path)

  return res.status(HTTPStatus.CREATED).send({
    objectURL: uploaded.objectURL,
  })
}

module.exports = {
  upload,
}
