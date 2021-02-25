const SwaggerParser = require('@apidevtools/swagger-parser')
const HTTPStatus = require('http-status-codes')
const bcrypt = require('bcrypt')
const path = require('path')
const log = require('../util/logger')
const enums = require('../util/enums')
const { v4: uuidv4 } = require('uuid')
const emailService = require('./email')
const { models, sequelize } = require('../models')
const { Op } = require('sequelize')
const { publishEvent, routingKeys } = require('../services/msg-broker')

const getAll = async (req, res) => {
  try {
    const users = await models.User.findAllPaginated({
      page: req.query.page || req.body.page,
      pageSize: req.query.pageSize || req.body.pageSize,
      options: { attributes: { exclude: ['password', 'activationToken'] } },
    })
    return res.status(HTTPStatus.OK).send(users)
  } catch (error) {
    log.error(error, '[USERS getAll]')
    return res.sendInternalError()
  }
}

const getById = async (req, res) => {
  const user = await models.User.findByPk(
    req.params.userId,
    { attributes: { exclude: ['password', 'activationToken'] } },
  )
  if (!user) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['User does not exist.'] })
  }
  return res.status(HTTPStatus.OK).send(user)
}

const getByLogin = async (req, res) => {
  const errorObj = { errors: ['The username / password combination is not correct'] }

  const user = await models.User.findByLogin(
    req.body.email,
  )

  if (!user || (user && user.activationToken)) {
    return res.status(HTTPStatus.UNAUTHORIZED).send(errorObj)
  }

  try {
    const passwordMatch = await checkPassword(req.body.password, user.password)

    if (passwordMatch.error) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: [passwordMatch.error] })
    }

    const response = {
      id: user.id,
      role_id: user.role_id,
      name: user.name,
      email: user.email,
    }

    return res.status(HTTPStatus.OK).send(response)
  } catch (e) {
    log.error(e, '[USERS login]')
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Failed to login.'] })
  }
}

const changePassword = async (req, res) => {
  const user = await models.User.findByPk(
    req.user.id,
  )

  const passwordMatch = await checkPassword(req.body.old_password, user.password)

  if (passwordMatch.error) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: [passwordMatch.error] })
  }

  let transaction
  try {
    transaction = await sequelize.transaction()
    user.password = req.body.new_password
    await user.save({ transaction })
    await transaction.commit()

    publishEvent(routingKeys.USER_PASSWORD, {
      user_id: req.user.id,
    })

    return res.status(HTTPStatus.OK).send({ success: true, message: 'Password changed successfully' })
  } catch (e) {
    if (transaction) await transaction.rollback()

    log.error(e, '[USERS changePassword]')
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Unable to update password.'] })
  }
}

const deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const userOrgs = await models.UserOrganization.getUserOrgsWithUsersCount(req.user.id, transaction)

    if (userOrgs.length) {
      const blockingOrgs = userOrgs.filter((org) => {
        const isDeveloper = org.role_name === enums.roles.DEVELOPER
        const isLastOwner = (org.organization_owners + org.admins) === 1
        return !isDeveloper && isLastOwner
      })

      if (blockingOrgs.length) {
        await transaction.rollback()
        return res.status(HTTPStatus.BAD_REQUEST).send({
          errors: [`User has organization dependencies: ${blockingOrgs.map((org) => org.org_name).join(', ')}`],
        })
      }
    }

    await models.User.destroy({
      where: { id: req.user.id },
      transaction,
    })

    await transaction.commit()

    publishEvent(routingKeys.USER_DELETED, {
      user_id: req.user.id,
    })

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    if (transaction) await transaction.rollback()
    log.error(error, '[USERS deleteUser]')
    return res.sendInternalError()
  }
}

const updateLastLogin = async (req, res) => {
  try {
    const user = await models.User.update(
      {
        last_login: Date.now(),
      },
      {
        where: { id: req.body.user_id },
        attributes: ['id', 'last_login'],
      },
    )

    if (!user) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Failed to update last date time login'] })
    }

    return res.status(HTTPStatus.OK).send(user)
  } catch (e) {
    log.error(e, '[USERS updateLastLogin]')
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Failed to upated last login.'] })
  }
}

const checkPassword = async (reqPassword, foundPassword) => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(reqPassword, foundPassword, (err, res) => {
      if (err) {
        reject(err)
      } else if (res) {
        resolve(res)
      } else {
        resolve({ error: 'Passwords dont match' })
      }
    }),
  )
}

const inviteUserToOrganization = async (req, res) => {
  try {
    const role = await models.Role.findOne({
      where: {
        id: req.body.role_id,
        level: { [Op.gte]: req.user.role.level },
      },
    })
    if (!role) return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Invalid invite role'] })

    const email = req.body.email
    const user = await models.User.findByLogin(email)

    // check if user is in the organization or is inviting himself
    if (user) {
      const inOrg = await models.UserOrganization.findOne({
        where: {
          user_id: user.id,
          org_id: req.user.org.id,
        },
      })

      // the id verification is redundant since we match the requester org when searching
      // keeping it for clarity
      if (inOrg || req.user.id === user.id) {
        return res.status(HTTPStatus.BAD_REQUEST).send({
          errors: ['Account already in organization.'],
        })
      }
    }

    const invite = await models.InviteOrganization.create(
      {
        user_id: !user ? null : user.id,
        org_id: req.user.org.id,
        role_id: role.id,
        email: email,
        status: 'pending',
        confirmation_token: uuidv4(),
      },
    )

    const invitationData = {
      org: req.user.org.name,
      email: email,
      token: invite.confirmation_token,
    }

    if (!user) {
      // if user does not exist send invitation to register into organization skipping organization step
      await emailService.sendInviteNewUserToOrg(invitationData)
    } else {
      await emailService.sendInviteToOrg(invitationData)
    }

    delete invite.confirmation_token

    publishEvent(routingKeys.ORG_USER_INVITED, {
      user_id: req.user.id,
      organization_id: req.user.org.id,
      log: `${req.body.email} was invited`,
    })

    return res.status(HTTPStatus.OK).send(invite)
  } catch (error) {
    log.error(error, '[USERS inviteUserToOrganization]')
    return res.sendInternalError()
  }
}

const getListInvitations = async (req, res) => {
  try {
    const list = await models.InviteOrganization.findAll({
      where: { org_id: req.user.org.id },
      attributes: ['user_id', 'email', 'status'],
    })

    return res.status(HTTPStatus.OK).send(list)
  } catch (error) {
    log.error(error, '[USERS getListInvitations]')
    return res.sendInternalError()
  }
}

const confirmInvite = async (req, res) => {
  const invite = await models.InviteOrganization.findByConfirmationToken(req.body.token)

  if (!invite) {
    return res.status(HTTPStatus.NOT_FOUND).end()
  }

  try {
    invite.confirmation_token = null
    invite.status = 'accepted'
    await invite.save()

    const org = await models.UserOrganization.create(
      {
        user_id: invite.user_id,
        org_id: invite.org_id,
        role_id: invite.role_id,
      },
    )

    if (!org) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Failed to assign User to Organization'] })
    }
  } catch (error) {
    log.error(error, '[USERS confirmInvite]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to confirm invite.'] })
  }

  return res.status(HTTPStatus.OK).send({ success: true, message: 'Invite confirmed with success.' })
}

const profileUpdate = async (req, res) => {
  try {
    const user = await models.User.update(
      {
        name: req.body.name,
        bio: req.body.bio,
        avatar: req.body.avatar,
        mobile: req.body.mobile,
      },
      {
        where: {
          id: req.user.id,
        },
      },
    )

    if (!user) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Failed to update Profile data.'] })
    }

    if (typeof req.body.org_id !== 'undefined' && req.body.org_id !== '') {
      const updateOldOrg = await models.UserOrganization.update(
        {
          current_org: false,
        },
        {
          where: {
            user_id: req.user.id,
            current_org: true,
          },
        },
      )

      if (!updateOldOrg) {
        return res.status(HTTPStatus.BAD_REQUEST).send({
          errors: ['Failed to update Profile data. It was not possible to change current_org = false to the old organization.'],
        })
      }

      const updateNewOrg = await models.UserOrganization.update(
        {
          current_org: true,
        },
        {
          where: {
            org_id: req.body.org_id,
            user_id: req.user.id,
            current_org: false,
          },
        },
      )

      if (!updateNewOrg) {
        return res.status(HTTPStatus.BAD_REQUEST).send({
          errors: ['Failed to update Profile data. It was not possible to change current_org = true to the new organization.'],
        })
      }
    }
  } catch (error) {
    log.error(error, '[USERS profileUpdate]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update profile.'] })
  }

  return res.status(HTTPStatus.OK).send({ success: true, message: 'Profile updated successfully.' })
}

const profile = async (req, res) => {
  const profile = {
    user: {},
    orgs_member: [],
    current_org: {},
  }

  const user = await models.User.findOne({
    where: {
      id: req.user.id,
    },
    attributes: [
      'id',
      'name',
      'bio',
      'email',
      'mobile',
      'avatar',
      'last_login',
      'oidcProvider',
    ],
  })

  if (!user) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['User not found'] })
  }

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

  return res.status(HTTPStatus.OK).send(profile)
}

const setupMainAccount = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const org = await models.Organization.create({
      name: req.body.organization.name,
      website: req.body.organization.website,
      vat: req.body.organization.vat,
      org_code: uuidv4(),
    }, { transaction })

    await sequelize.query('INSERT INTO owner_organization (organization_id) VALUES (?);', {
      replacements: [org.id],
      transaction,
    })

    if (req.body.settings) {
      const newSettings = {}
      for (const prop in req.body.settings) {
        newSettings[prop] = req.body.settings[prop]
      }

      await models.Setting.create({
        type: enums.settingTypes.ACCOUNT,
        values: newSettings,
      }, { transaction })
    }

    const role = await models.Role.findOne({
      where: { name: 'admin' },
      transaction,
    })
    if (!role) throw new Error('missing admin role')

    const invite = await models.InviteOrganization.create({
      user_id: null,
      org_id: org.id,
      role_id: role.id,
      email: req.body.email,
      status: 'pending',
      confirmation_token: uuidv4(),
    }, { transaction })

    const petstore = await SwaggerParser.validate(path.join(__dirname, '../util/petstore3.json'))

    const api = await models.Api.create({
      name: petstore.info.title,
      baseUri: 'https://example.petstore.io/',
      docs: [
        {
          title: petstore.info.title,
          info: petstore.info.description,
          target: enums.contentTargets.PRODUCT_INTRO,
        },
      ],
      publishedAt: new Date(),
    }, { transaction })

    await models.ApiVersion.create({
      title: petstore.info.title,
      version: petstore.info.version,
      live: true,
      apiId: api.id,
      spec: petstore,
    }, { transaction })

    const invitationData = {
      org: req.body.organization.name,
      email: req.body.email,
      token: invite.confirmation_token,
    }

    await emailService.sendInviteNewUserToOrg(invitationData)

    await transaction.commit()

    return res.status(HTTPStatus.OK).send(invite)
  } catch (error) {
    if (transaction) await transaction.rollback()
    // restore the setup token so the operation can be retried
    await sequelize.query('UPDATE setup_token SET used = false;')

    log.error(error, '[USERS setupMainAccount]')
    return res.sendInternalError()
  }
}

module.exports = {
  getAll,
  getById,
  getByLogin,
  deleteUser,
  changePassword,
  inviteUserToOrganization,
  getListInvitations,
  confirmInvite,
  profileUpdate,
  updateLastLogin,
  profile,
  setupMainAccount,
}
