const config = require('../../config')
const { storageProviders } = require('../../util/enums')
const LocalStorage = require('./local')
const S3 = require('./s3')

const getStorageClient = () => {
  const storageConfig = config.get('storage')

  switch (storageConfig.provider) {
    case storageProviders.S3: return new S3(storageConfig.s3)
    default: return new LocalStorage()
  }
}

module.exports = {
  getStorageClient,
}
