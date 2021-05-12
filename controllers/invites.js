const HTTPStatus = require('http-status-codes')
const { models, sequelize } = require('../models')
const log = require('../util/logger')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const emailService = require('../services/email')

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

const signup = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const invite = await models.InviteOrganization.findOne({
      where: {
        confirmation_token: req.params.token,
        status: 'pending',
      },
      transaction,
    })

    if (!invite) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Invite not found'] })
    }

    const activationToken = uuidv4()
    const user = await models.User.create({
      name: req.body.name,
      email: invite.email.toLowerCase(),
      password: req.body.password,
      activationToken,
      role_id: invite.role_id,
    }, { transaction })

    await models.UserOrganization.create({
      user_id: user.id,
      org_id: invite.org_id,
      role_id: invite.role_id,
      current_org: true,
    }, { transaction })

    invite.confirmation_token = null
    invite.status = 'accepted'
    await invite.save({ transaction })

    await transaction.commit()

    res.sendStatus(HTTPStatus.NO_CONTENT)

    const ownerOrg = await models.Organization.getOwnerOrganization()
    await emailService.sendRegisterConfirmation({
      email: req.body.email,
      token: activationToken,
    }, { logo: ownerOrg?.logo })
  } catch (err) {
    await transaction.rollback()
    log.error(err, '[INVITE SIGNUP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['failed to complete user signup'] })
  }
}

module.exports = {
  get,
  accept,
  reject,
  signup,
}
