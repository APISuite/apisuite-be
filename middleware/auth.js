const HTTPStatus = require('http-status-codes')
const { models } = require('../models')
const { roles } = require('../util/enums')
const jwt = require('../services/jwt')

const getTokenUserByID = async (userID) => {
  let user = await models.User.findOne({
    where: { id: userID },
    attributes: ['id', 'name', 'email'],
  })

  if (!user) return
  user = user.get({ plain: true })

  const orgs = await models.UserOrganization.findAll({
    where: { user_id: user.id },
    attributes: ['org_id', 'current_org'],
    include: [{
      model: models.Role,
      as: 'Role',
      attributes: ['name', 'id', 'level'],
    },
    {
      model: models.Organization,
      as: 'Organization',
      attributes: ['name', 'id'],
    }],
  })

  user.organizations = orgs.map((o) => {
    const _org = o.get({ plain: true })
    return {
      ..._org.Organization,
      role: _org.Role,
      current_org: _org.current_org,
    }
  })
  const currentOrg = user.organizations.find((o) => o.current_org)
  user.org = currentOrg
  user.role = currentOrg ? currentOrg.role : null

  return user
}

const cookieAuth = async (req, res, next) => {
  if (req.cookies.access_token) {
    const token = jwt.validateAccessToken(req.cookies.access_token)
    if (!token.valid) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['The account is not active, token must have expired. Please login to obtain a new one'] })
    }

    const user = await getTokenUserByID(token.payload.sub)
    if (!user) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['User not found'] })
    }

    res.locals.loggedInUser = user
    res.locals.isAdmin = res.locals.loggedInUser &&
      res.locals.loggedInUser.role &&
      res.locals.loggedInUser.role.name === roles.ADMIN
  }

  next()
}

const apiTokenAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = await models.APIToken.findOne({
      where: { token: req.headers.authorization.substring(7) },
    })
    if (!token) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['invalid token'] })
    }

    const user = await getTokenUserByID(token.userId)
    if (!user) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['User not found'] })
    }

    res.locals.loggedInUser = user
    res.locals.isAdmin = res.locals.loggedInUser &&
      res.locals.loggedInUser.role &&
      res.locals.loggedInUser.role.name === roles.ADMIN
  }

  next()
}

module.exports = {
  cookieAuth,
  apiTokenAuth,
}
