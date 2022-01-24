const { v4: uuidv4 } = require('uuid')
const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const emailService = require('../services/email')
const { models, sequelize } = require('../models')
const { roles } = require('../util/enums')
const { publishEvent, routingKeys } = require('../services/msg-broker')

const confirmRegistration = async (req, res) => {
  const user = await models.User.findByActivationToken(req.body.token)
  if (!user) {
    return res.status(HTTPStatus.NOT_FOUND).end()
  }

  try {
    user.activationToken = null
    await user.save()
  } catch (error) {
    log.error(error, '[CONFIRM USER REGISTRATION]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to confirm user registration.'] })
  }

  return res.status(HTTPStatus.OK).send({ success: true, message: 'User confirmed with success.' })
}

const validateInvitation = async (req, res) => {
  try {
    const invite = await models.InviteOrganization.findByConfirmationToken(req.body.token)
    if (!invite) {
      return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Invalid registration token.'] })
    }

    return res.status(HTTPStatus.OK).send({ email: invite.email })
  } catch (error) {
    log.error(error, '[REGISTRATION validateInvitation]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to validate invitation.'] })
  }
}

const register = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const [userFound, defaultRole] = await Promise.all([
      await models.User.findOne({
        where: { email: req.body.user.email.toLowerCase() },
        transaction,
      }),
      await models.Role.findOne({
        where: { name: roles.ORGANIZATION_OWNER },
        transaction,
      }),
    ])

    if (userFound) {
      await transaction.rollback()
      return res.sendStatus(HTTPStatus.NO_CONTENT)
    }
    if (!defaultRole) throw new Error('missing organizationOwner role')

    let newOrganization
    if (req.body.organization) {
      const orgFound = await models.Organization.findOne({
        where: { name: req.body.organization },
        transaction,
      })
      if (orgFound) {
        await transaction.rollback()
        return res.status(HTTPStatus.BAD_REQUEST).send({ errors: 'organization name already taken' })
      }

      newOrganization = await models.Organization.create({
        name: req.body.organization.name,
        websiteUrl: req.body.organization.website,
      }, { transaction })
    }

    const user = await models.User.create({
      name: req.body.user.name,
      email: req.body.user.email.toLowerCase(),
      password: req.body.user.password,
      activationToken: uuidv4(),
    }, { transaction })

    if (newOrganization) {
      await models.UserOrganization.create({
        user_id: user.id,
        org_id: newOrganization.id,
        role_id: defaultRole.id,
        current_org: true,
      }, { transaction })
    }

    await transaction.commit()

    res.sendStatus(HTTPStatus.NO_CONTENT)

    const ownerOrg = await models.Organization.getOwnerOrganization()
    await emailService.sendRegisterConfirmation({
      email: user.email,
      token: user.activationToken,
    }, { logo: ownerOrg?.logo })

    publishEvent(routingKeys.USER_CREATED, {
      user_id: user.id,
    })
  } catch (err) {
    if (transaction) await transaction.rollback()
    log.error(err, '[DELETE APP]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ success: false, errors: ['Failed to delete app.'] })
  }
}

module.exports = {
  confirmRegistration,
  validateInvitation,
  register,
}
