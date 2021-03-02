const HTTPStatus = require('http-status-codes')
const AccessControl = require('accesscontrol')
const { resources, possessions } = require('../access-control')
const { models } = require('../models')

const fetchGrants = async () => {
  const roles = await models.Role.findAll({ attributes: ['name', 'grants'], raw: true })

  const grants = {}
  for (const role of roles) {
    grants[role.name] = role.grants
  }

  return grants
}

const sendForbidden = (res) => {
  return res.status(HTTPStatus.FORBIDDEN).json({
    errors: ['You don\'t have permission to perform this action'],
  })
}

/**
 * @param {String} action - Access control action (create, read, update, delete)
 * @param {String} possession - Access control possession (any, own)
 * @param {String} resource - Access control resource name
 * @param {Object} options
 * @param {String} options.idCarrier - Express request field that carries the resource ID (params, body, etc)
 * @param {String} options.idField - Field name that corresponds to the resource ID in the idCarrier (ex.: /:userId)
 * */
const accessControl = (action, possession, resource, options = {}) => {
  return async (req, res, next) => {
    if (!req.user.role) return sendForbidden(res)

    const permission = ac.permission({
      role: req.user.role.name,
      resource,
      action,
      possession,
    })
    if (!permission.granted) return sendForbidden(res)

    switch (resource) {
      case resources.ORGANIZATION: {
        const { idCarrier, idField } = options
        if (possession === possessions.OWN && idCarrier && idCarrier.length && idField && idField.length) {
          const organizationID = req[idCarrier][idField]
          const ownsOrg = req.user.organizations.find((o) => o.id === parseInt(organizationID))
          if (!ownsOrg) return sendForbidden(res)
        }
        break
      }
      case resources.APP: {
        const { idCarrier, idField } = options
        if (possession === possessions.OWN && idCarrier && idCarrier.length && idField && idField.length) {
          const app = await models.App.findOne({
            where: {
              id: req[idCarrier][idField],
              org_id: req.user.org.id,
            },
          })
          if (!app) return sendForbidden(res)
        }
        break
      }
    }

    next()
  }
}

let ac
(async () => {
  ac = new AccessControl(await fetchGrants())
  ac.lock()
})()

module.exports = accessControl
