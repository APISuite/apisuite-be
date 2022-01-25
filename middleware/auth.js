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
  try {
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
  } catch (err) {
    return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['invalid token'] })
  }
}

const apiTokenAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const parsedToken = req.headers.authorization.substring(7)

      let [tokenId, ...tokenValue] = parsedToken.split('_')
      tokenValue = tokenValue.join('_')

      const apiToken = await models.APIToken.findByPk(tokenId)
      if (!apiToken) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['invalid token'] })
      }

      if (!apiToken.checkToken(tokenValue)) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['invalid token'] })
      }

      const user = await getTokenUserByID(apiToken.userId)
      if (!user) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['User not found'] })
      }

      res.locals.loggedInUser = user
      res.locals.isAdmin = res.locals.loggedInUser &&
        res.locals.loggedInUser.role &&
        res.locals.loggedInUser.role.name === roles.ADMIN
    }

    next()
  } catch (err) {
    return res.status(HTTPStatus.UNAUTHORIZED).json({ errors: ['invalid token'] })
  }
}

module.exports = {
  cookieAuth,
  apiTokenAuth,
}
