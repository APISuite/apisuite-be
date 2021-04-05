const fs = require('fs')
const Storage = require('./storage')
const log = require('../../util/logger')
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

class S3 extends Storage {
  async saveFile (filePath, name) {
    const errorObject = {
      objectURL: null,
      error: new Error('failed to upload file to storage'),
    }
    const client = new S3Client(this.config)

    const fileStream = fs.createReadStream(filePath)
    fileStream.on('error', (error) => {
      log.error(error, '[S3 READ STREAM]')
      return errorObject
    })

    const cmd = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: name,
      Body: fileStream,
    })

    try {
      await client.send(cmd)
    } catch (error) {
      log.error(error, '[S3 PUT OBJECT]')
      return errorObject
    }

    return {
      objectURL: `https://${this.config.bucket}.s3-${this.config.region}.amazonaws.com/${name}`,
      error: null,
    }
  }

  async deleteFile (objectURL) {
    const client = new S3Client(this.config)

    const cmd = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: objectURL.split('/').pop(),
    })

    try {
      await client.send(cmd)
    } catch (error) {
      log.error(error, '[S3 DELETE OBJECT]')
      return new Error('failed to delete media object')
    }

    return null
  }
}

module.exports = S3
