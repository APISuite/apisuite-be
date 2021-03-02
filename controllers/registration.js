const { v4: uuidv4 } = require('uuid')
const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const emailService = require('./email')
const { models, sequelize } = require('../models')
const { roles } = require('../util/enums')
const config = require('../config')

const isRegistrationValid = (createdAt) => {
  return new Date(createdAt).getTime() + config.get('registrationTTL') * 60 * 1000 >= Date.now()
}

const setUserDetails = async (req, res) => {
  const user = await models.User.findByLogin(req.body.email.toLowerCase())
  if (user) {
    return res.status(HTTPStatus.CONFLICT).send({ errors: ['Email is already in use'] })
  }

  const wasInvited = !!req.body.token

  let registrationToken = uuidv4()
  let email = req.body.email

  if (wasInvited) {
    registrationToken = req.body.token
    const invite = await models.InviteOrganization.findByConfirmationToken(req.body.token)
    email = invite.email
  }

  try {
    await models.UserRegistration.create({
      id: registrationToken,
      name: req.body.name,
      email,
      bio: req.body.bio,
      avatar: req.body.avatar,
      mobile: req.body.mobile,
    })
  } catch (error) {
    log.error(error, '[CREATE USER REGISTRATION]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to create user registration.'] })
  }

  return res.status(HTTPStatus.CREATED).send({ token: registrationToken })
}

const setOrganizationDetails = async (req, res) => {
  const registration = await models.UserRegistration.findByPk(req.body.registrationToken)
  if (!registration) {
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Missing registration token.'] })
  }

  if (!isRegistrationValid(registration.createdAt)) {
    await registration.destroy()
    return res.status(HTTPStatus.UNAUTHORIZED).end()
  }

  const orgFound = await models.Organization.findOne({
    where: { name: req.body.name },
  })
  if (orgFound) {
    log.info(`Organization ${req.body.name} already exists`)
    return res.status(HTTPStatus.CONFLICT).send({ errors: ['Organization already exists.'] })
  }

  try {
    registration.organizationName = req.body.name
    registration.organizationWebsite = req.body.website
    await registration.save()

    return res.status(HTTPStatus.OK).end()
  } catch (error) {
    log.error(error, '[REGISTRATION: SET ORGANIZATION]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update registration.'] })
  }
}

const completeRegistration = async (req, res) => {
  let registration = await models.UserRegistration.findByPk(req.body.registrationToken)
  if (!registration) {
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Missing registration token.'] })
  }

  if (!isRegistrationValid(registration.createdAt)) {
    await registration.destroy()
    return res.status(HTTPStatus.UNAUTHORIZED).end()
  }

  let wasInvited = false
  let invite = null
  try {
    // TODO deprecated - remove when new invite flow is implemented
    invite = await models.InviteOrganization.findByConfirmationToken(req.body.registrationToken)
    wasInvited = !!(invite && invite.email)
  } catch (error) {
    wasInvited = false
  }

  registration = registration.get({ plain: true })

  const transaction = await sequelize.transaction()
  try {
    let organization = {}

    if (wasInvited) {
      organization = {
        id: invite.org_id,
      }
    } else if (registration.organizationName && registration.organizationName.length) {
      organization = await models.Organization.create({
        name: registration.organizationName,
        website: registration.organizationWebsite,
        org_code: uuidv4(),
      }, { transaction })
    }

    const defaultRole = await models.Role.findOne({
      where: { name: roles.ORGANIZATION_OWNER },
      transaction,
    })
    if (!defaultRole) throw new Error('missing organizationOwner role')

    const activationToken = uuidv4()

    const user = await models.User.create({
      name: registration.name,
      email: registration.email.toLowerCase(),
      password: req.body.password,
      bio: req.body.bio,
      avatar: req.body.avatar,
      mobile: req.body.mobile,
      activationToken,
      role_id: wasInvited ? invite.role_id : defaultRole.id,
    }, { transaction })

    if (organization.id) {
      await models.UserOrganization.create({
        user_id: user.id,
        org_id: organization.id,
        role_id: user.role_id,
        current_org: true,
      }, { transaction })
    }

    await models.UserRegistration.destroy({
      where: { id: registration.id },
      transaction,
    })

    await emailService.sendRegisterConfirmation({
      email: user.email,
      token: activationToken,
    })

    await transaction.commit()

    if (wasInvited) {
      invite.confirmation_token = null
      invite.status = 'accepted'
      await invite.save()
    }

    return res.status(HTTPStatus.CREATED).send({ message: 'User registered. Pending confirmation.' })
  } catch (error) {
    if (transaction) await transaction.rollback()

    log.error(error, '[COMPLETE REGISTRATION]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to complete user registration.'] })
  }
}

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

module.exports = {
  setUserDetails,
  setOrganizationDetails,
  completeRegistration,
  confirmRegistration,
  validateInvitation,
}
