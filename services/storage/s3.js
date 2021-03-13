const Storage = require('./storage')

class S3 extends Storage {
  async saveFile (filePath, name) {
    super.saveFile(filePath, name)
  }
}

module.exports = S3
