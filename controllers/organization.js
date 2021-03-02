const HTTPStatus = require('http-status-codes')
const { v4: uuidv4 } = require('uuid')
const log = require('../util/logger')
const { models, sequelize } = require('../models')
const { roles } = require('../util/enums')
const { publishEvent, routingKeys } = require('../services/msg-broker')

const getAll = async (req, res) => {
  const include = req.query.include || []

  let orgs
  if (include.includes('appCount') && res.locals.isAdmin) {
    orgs = await models.Organization.getWithAppCount()
  } else {
    orgs = await models.Organization.findAllPaginated({
      page: req.query.page,
      pageSize: req.query.pageSize,
    })
  }

  return res.status(HTTPStatus.OK).send(orgs)
}

const getById = async (req, res) => {
  const org = await models.Organization.findByPk(
    req.params.orgId,
  )
  if (!org) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Organization with inputed id does not exist.'] })
  }
  return res.status(HTTPStatus.OK).send(org)
}

const addOrg = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const org = await models.Organization.findOne({
      where: { name: req.body.name },
      transaction,
    })

    if (org) {
      await transaction.rollback()
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Organization already exists.'] })
    }

    const defaultRole = await models.Role.findOne({
      where: { name: roles.ORGANIZATION_OWNER },
      transaction,
    })
    if (!defaultRole) {
      await transaction.rollback()
      throw new Error('missing organizationOwner role')
    }

    const newOrganization = await models.Organization.create({
      name: req.body.name,
      description: req.body.description,
      vat: req.body.vat,
      website: req.body.website,
      terms: req.body.terms,
      logo: req.body.logo,
      org_code: uuidv4(),
      tosUrl: req.body.tosUrl,
      privacyUrl: req.body.privacyUrl,
      youtubeUrl: req.body.youtubeUrl,
      websiteUrl: req.body.websiteUrl,
      supportUrl: req.body.supportUrl,
    }, { transaction })

    await models.UserOrganization.create({
      user_id: req.user.id,
      org_id: newOrganization.id,
      role_id: defaultRole.id,
    }, { transaction })

    await transaction.commit()

    publishEvent(routingKeys.ORG_CREATED, {
      user_id: req.user.id,
      organization_id: newOrganization.id,
    })

    return res.status(HTTPStatus.CREATED).send(newOrganization)
  } catch (error) {
    if (transaction) await transaction.rollback()
    log.error(error, '[CREATE ORGANIZATION]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to create Organization.'] })
  }
}

const deleteOrg = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const appCount = await models.App.count({
      where: { org_id: req.params.orgId },
    }, { transaction })

    if (appCount) {
      await transaction.rollback()
      return res.status(HTTPStatus.BAD_REQUEST).send({
        errors: ['There are active applications. Please delete them first.'],
      })
    }

    await models.Organization.destroy({
      where: { id: req.params.orgId },
      transaction,
    })

    await transaction.commit()

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    if (transaction) await transaction.rollback()
    log.error(error, '[ORGANIZATION deleteOrg]')
    return res.sendInternalError()
  }
}

const updateOrg = async (req, res) => {
  const [rowsUpdated, [updated]] = await models.Organization.update(req.body,
    {
      returning: true,
      where: {
        id: req.params.id,
      },
    },
  )

  if (!rowsUpdated) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Organization not found'] })
  }

  publishEvent(routingKeys.ORG_UPDATED, {
    user_id: req.user.id,
    organization_id: req.params.id,
  })

  return res.status(HTTPStatus.OK).send(updated)
}

const assignUserToOrg = async (req, res) => {
  try {
    const userId = req.body.user_id
    const orgId = req.body.org_id
    let roleId = null

    if (typeof req.body.role_id === 'undefined' || req.body.role_id === '') {
      roleId = req.user.role.id
    } else {
      roleId = req.body.role_id
    }

    let org = await models.UserOrganization.findOne(
      {
        where: {
          user_id: userId,
          org_id: orgId,
        },
      },
    )

    if (org) {
      org = await models.UserOrganization.update(
        {
          role_id: roleId,
        },
        {
          where: {
            user_id: userId,
            org_id: orgId,
          },
        },
      )
    } else {
      org = await models.UserOrganization.create(
        {
          user_id: userId,
          org_id: orgId,
          role_id: roleId,
        },
      )
    }

    publishEvent(routingKeys.ORG_USER_ROLE, {
      user_id: req.user.id,
      organization_id: req.user.org.id,
      log: `User ${req.body.user_id} was assigned the role ${roleId}`,
    })

    return res.status(HTTPStatus.OK).send(org)
  } catch (error) {
    log.error(error, '[ASSIGN USER TO ORGANIZATION]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to assign user to the organization.'] })
  }
}

const getAllMembers = async (req, res) => {
  const members = await models.UserOrganization.findMembers(
    req.user.org.id,
    models,
  )

  return res.status(HTTPStatus.OK).send(members)
}

const getPendingInvites = async (req, res) => {
  const list = await models.InviteOrganization.findAll({
    where: {
      org_id: req.user.org.id,
      status: 'pending',
    },
    attributes: ['email'],
  })

  return res.status(HTTPStatus.OK).send(list)
}

module.exports = {
  getAll,
  getById,
  addOrg,
  deleteOrg,
  updateOrg,
  assignUserToOrg,
  getAllMembers,
  getPendingInvites,
}
