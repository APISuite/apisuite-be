const fs = require('fs').promises
const path = require('path')
const config = require('../../config')
const Storage = require('./storage')
const log = require('../../util/logger')

class LocalStorage extends Storage {
  async saveFile (filePath, name) {
    const result = {
      objectURL: null,
      error: null,
    }

    try {
      const newPath = path.join(__dirname, `../../media/${name}`)
      await fs.copyFile(filePath, newPath)
      result.objectURL = `${config.get('apiURL')}/media/${name}`
    } catch (err) {
      result.error = err
    }

    return result
  }

  async deleteFile (objectURL) {
    try {
      const fileName = objectURL.split('/').pop()
      const filePath = path.join(__dirname, `../../media/${fileName}`)
      await fs.unlink(filePath)
    } catch (error) {
      log.error(error, '[LOCAL DELETE OBJECT]')
      return new Error('failed to delete media object')
    }

    return null
  }
}

module.exports = LocalStorage
