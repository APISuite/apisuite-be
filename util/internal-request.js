const HTTPStatus = require('http-status-codes')
const log = require('./logger')

const isInternalRequest = (req, res, next) => {
  const token = process.env.INTERNAL_TOKEN || 'U3VwM3JTM0NyMzdQNCQkLWYwci00ZE0xTg==' // echo -n "Sup3rS3Cr37P4\$\$-f0r-4dM1N" | base64

  const inToken = req.get('x-internal-token')

  if (!inToken || inToken !== token) {
    log.info(`User (${req.ip}) trying to use protected endpoint.`, '[isInternalRequest]')
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['This endpoint can only be used by internal request.'] })
  }

  next()
}

module.exports = {
  isInternalRequest,
}
