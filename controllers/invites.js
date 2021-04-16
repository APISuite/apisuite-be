const HTTPStatus = require('http-status-codes')
const { models } = require('../models')
const { Op } = require('sequelize')

const get = async (req, res) => {
  const invite = await models.InviteOrganization.findOne({
    where: {
      confirmation_token: req.params.token,
      status: 'pending',
    },
    include: [
      {
        model: models.User,
        as: 'User',
        attributes: ['email'],
      },
      {
        model: models.Organization,
        as: 'Organization',
        attributes: ['name'],
      },
    ],
  })

  if (!invite) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Invite not found'] })
  }

  let belongsToOrganizations = false
  if (invite.User) {
    const userOrgs = await models.UserOrganization.findAll({
      where: {
        user_id: invite.user_id,
        org_id: { [Op.ne]: invite.org_id },
      },
    })
    if (userOrgs) {
      belongsToOrganizations = true
    }
  }

  return res.status(HTTPStatus.OK).send({
    email: invite.email,
    organization: invite.Organization.name,
    isUser: invite.User !== null,
    hasOrganizations: belongsToOrganizations,
  })
}

const accept = async (req, res) => {
  const invite = await models.InviteOrganization.findByConfirmationToken(req.params.token)

  if (!invite) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Invite not found'] })
  }

  const userOrgs = await models.UserOrganization.count({
    where: { user_id: req.user.id },
  })

  invite.confirmation_token = null
  invite.status = 'accepted'
  await invite.save()

  await models.UserOrganization.create({
    user_id: req.user.id,
    org_id: invite.org_id,
    role_id: invite.role_id,
    current_org: !userOrgs,
  })

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

const reject = async (req, res) => {
  const invite = await models.InviteOrganization.findByConfirmationToken(req.params.token)

  if (!invite) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Invite not found'] })
  }

  await invite.destroy()

  return res.sendStatus(HTTPStatus.NO_CONTENT)
}

module.exports = {
  get,
  accept,
  reject,
}
