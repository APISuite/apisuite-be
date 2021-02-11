const HTTPStatus = require('http-status-codes')
const log = require('./logger')

const isAdmin = (req, res, next) => {
  const token = process.env.ADMIN_TOKEN || 'U3VwM3JTM0NyMzdQNCQkLWYwci00ZE0xTg==' // echo -n "Sup3rS3Cr37P4\$\$-f0r-4dM1N" | base64

  const adminToken = req.get('x-admin-token')

  if (!adminToken || adminToken !== token) {
    log.info(`User (${req.ip}) trying to use protected endpoint.`, '[isAdmin]')
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['This endpoint can only be used by admins.'] })
  }

  next()
}

module.exports = {
  isAdmin,
}
