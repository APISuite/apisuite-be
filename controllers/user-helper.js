const { models } = require('../models')
const Idp = require('../services/idp')

const getUserProfile = async (id) => {
  const profile = {
    user: {},
    orgs_member: [],
    current_org: {},
  }

  const user = await models.User.findByPk(id, {
    attributes: [
      'id',
      'name',
      'bio',
      'email',
      'mobile',
      'avatar',
      'last_login',
      'oidcProvider',
      'oidcId',
    ],
  })

  if (!user) return null

  profile.user = user.get({ plain: true })

  const orgs = await models.UserOrganization.findAll({
    where: { user_id: user.id },
    attributes: ['org_id', 'current_org', 'created_at'],
    include: [{
      model: models.Role,
      as: 'Role',
      attributes: ['name', 'id'],
    }, {
      model: models.Organization,
      as: 'Organization',
      attributes: ['name', 'id'],
    }],
  })

  for (const org of orgs) {
    if (org.dataValues.current_org) {
      profile.current_org = org.dataValues.Organization.dataValues
      profile.current_org.member_since = org.dataValues.created_at
      profile.current_org.role = org.dataValues.Role.dataValues
    }

    const orgsMember = {
      id: org.dataValues.Organization.dataValues.id,
      name: org.dataValues.Organization.dataValues.name,
    }
    profile.orgs_member.push(orgsMember)
  }

  const idp = await Idp.getIdP()
  profile.ssoAccountURL = idp.getUserProfileURL(user.oidcId)

  return profile
}

module.exports = {
  getUserProfile,
}
