const HTTPStatus = require('http-status-codes')
const AccessControl = require('accesscontrol')
const { resources, possessions, roles } = require('../util/enums')
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
 * @param {Boolean} options.adminOverride - If true, 'admin' role gets access to the resource, independently of grants. Default false
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

    const { idCarrier, idField, adminOverride = false } = options

    if (adminOverride && req.user.role.name === roles.ADMIN) return next()

    switch (resource) {
      case resources.ORGANIZATION: {
        if (checkOwnPossessionAndIdField(possession, idCarrier, idField)) {
          const organizationID = req[idCarrier][idField]
          const ownsOrg = req.user.organizations.find((o) => o.id === parseInt(organizationID))
          if (!ownsOrg) return sendForbidden(res)
        }
        break
      }
      case resources.APP: {
        if (checkOwnPossessionAndIdField(possession, idCarrier, idField)) {
          const app = await models.App.findOne({
            where: {
              id: req[idCarrier][idField],
              org_id: req.user.organizations.map((org) => org.id),
            },
          })
          if (!app) return sendForbidden(res)
        }
        break
      }
      case resources.PROFILE: {
        if (checkOwnPossessionAndIdField(possession, idCarrier, idField)) {
          if (req.user.id !== parseInt(req[idCarrier][idField])) return sendForbidden(res)
        }
        break
      }
    }

    next()
  }
}

/**
 * Checks if configured access control possession is OWN and if id field is present in the configured carrier.
 * @param {String} possession
 * @param {String} idCarrier
 * @param {String} idField
 * @returns {Boolean}
 * */
const checkOwnPossessionAndIdField = (possession, idCarrier, idField) => (
  possession === possessions.OWN && idCarrier && idCarrier.length && idField && idField.length
)

let ac
(async () => {
  ac = new AccessControl(await fetchGrants())
  ac.lock()
})()

module.exports = accessControl
