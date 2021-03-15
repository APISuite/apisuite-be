const Storage = require('./storage')
const log = require('../../util/logger')
const {
  S3Client,
  PutObjectCommand,
} = require('@aws-sdk/client-s3')

class S3 extends Storage {
  async saveFile (filePath, name) {
    const client = new S3Client(this.config)

    const cmd = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: name,
      Body: filePath,
    })

    try {
      await client.send(cmd)
    } catch (error) {
      log.error('[S3 PUT OBJECT] ', error)
      return {
        objectURL: null,
        error: new Error('failed to upload file to storage'),
      }
    }

    return {
      objectURL: `s3://${this.config.bucket}/${name}`,
      error: null,
    }
  }
}

module.exports = S3
