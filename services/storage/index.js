const config = require('../../config')
const { storageProviders } = require('../../util/enums')
const Storage = require('./storage')

const getStorageClient = () => {
  const storageConfig = config.get('storage')

  switch (storageConfig.provider) {
    case storageProviders.S3: return new S3(storageConfig.s3)
    default: throw new Error('IdP Provider not implemented')
  }
}

module.exports = {
  getStorageClient,
}
