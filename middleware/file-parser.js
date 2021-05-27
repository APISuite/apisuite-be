const formidable = require('formidable')
const config = require('../config')

module.exports = async (req, res, next) => {
  // if no files skip
  if (req.header('Content-Type').indexOf('multipart/form-data') === -1) return next()

  const form = formidable({
    multiples: true,
    maxFileSize: config.get('maxFileSizeUpload'),
  })

  await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      req.formdata = { fields, files }
      resolve()
    })
  })
  await next()
}
