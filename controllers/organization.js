const HTTPStatus = require('http-status-codes')
const { Op } = require('sequelize')
const log = require('../util/logger')
const { models, sequelize } = require('../models')
const { roles } = require('../util/enums')
const { publishEvent, routingKeys } = require('../services/msg-broker')
const excludeFields = ['id', 'createdAt', 'updatedAt']
const exclude = ['addressId']

const getAll = async (req, res) => {
  const include = req.query.include || []
  const _exclude = [...exclude]

  if (!res.locals.isAdmin) {
    _exclude.push('taxExempt')
  }

  let orgs
  if (include.includes('appCount') && res.locals.isAdmin) {
    orgs = await models.Organization.getWithAppCount()
  } else {
    orgs = await models.Organization.findAllPaginated({
      options: {
        attributes: { exclude: _exclude },
        include: [{
          model: models.Address,
          attributes: {
            exclude: excludeFields,
          },
        }],
      },
      page: req.query.page,
      pageSize: req.query.pageSize,
    })
  }

  return res.status(HTTPStatus.OK).send(orgs)
}

const getById = async (req, res) => {
  const org = await models.Organization.findByPk(req.params.orgId, {
    attributes: { exclude },
    include: [{
      model: models.Address,
      attributes: {
        exclude: excludeFields,
      },
    }],
  })
  if (!org) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Organization with inputed id does not exist.'] })
  }

  return res.status(HTTPStatus.OK).send(org)
}

const addOrg = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const _exclude = [...exclude]
    _exclude.push('taxExempt')

    const org = await models.Organization.findOne({
      where: { name: req.body.name },
      transaction,
    })

    if (org) {
      await transaction.rollback()
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['Organization already exists.'] })
    }

    let newOrg = {
      name: req.body.name,
      description: req.body.description,
      vat: req.body.vat,
      terms: req.body.terms,
      logo: req.body.logo,
      tosUrl: req.body.tosUrl,
      privacyUrl: req.body.privacyUrl,
      youtubeUrl: req.body.youtubeUrl,
      websiteUrl: req.body.websiteUrl,
      supportUrl: req.body.supportUrl,
    }

    if (req.body.address) {
      newOrg = { ...newOrg, address: req.body.address }
    }

    const newOrganization = await models.Organization.create(
      newOrg,
      {
        include: [
          {
            model: models.Address,
          },
        ],
        transaction,
      })

    const { selfAssignNewOrganization } = req.body.options || {}
    if (selfAssignNewOrganization === undefined || selfAssignNewOrganization) {
      const defaultRole = await models.Role.findOne({
        where: { name: roles.ORGANIZATION_OWNER },
        transaction,
      })
      if (!defaultRole) {
        await transaction.rollback()
        throw new Error('missing organizationOwner role')
      }

      const userOrgs = await models.UserOrganization.count({
        where: { user_id: req.user.id },
      }, { transaction })

      await models.UserOrganization.create({
        user_id: req.user.id,
        org_id: newOrganization.id,
        role_id: defaultRole.id,
        current_org: !userOrgs,
      }, { transaction })
    }

    await transaction.commit()

    const organization = await models.Organization.findByPk(newOrganization.id, {
      attributes: { exclude: _exclude },
      include: [{
        model: models.Address,
        attributes: {
          exclude: excludeFields,
        },
      }],
    })

    return res.status(HTTPStatus.CREATED).send(organization)
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

    publishEvent(routingKeys.ORG_DELETED, {
      organization_id: req.params.orgId,
    })

    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    if (transaction) await transaction.rollback()
    log.error(error, '[ORGANIZATION deleteOrg]')
    return res.sendInternalError()
  }
}

const updateOrg = async (req, res) => {
  const _exclude = [...exclude]
  _exclude.push('taxExempt')

  const transaction = await sequelize.transaction()

  if (req.body.address) {
    const data = await models.Organization.findByPk(req.params.id, {
      include: [{
        model: models.Address,
      }],
      transaction,
    })

    if (data.addressId) {
      await models.Address.update(req.body.address, {
        returning: true,
        where: {
          id: data.addressId,
        },
        transaction,
      })
    } else {
      const newAddress = await models.Address.create({
        address: req.body.address.address,
        postalCode: req.body.address.postalCode,
        city: req.body.address.city,
        country: req.body.address.country,
      }, { transaction })

      await models.Organization.update({
        addressId: newAddress.id,
      }, {
        where: {
          id: req.params.id,
        },
        transaction,
      })
    }

    delete req.body.address
  }

  if (Object.keys(req.body).length) {
    const [rowsUpdated, [updated]] = await models.Organization.update(req.body,
      {
        returning: true,
        where: {
          id: req.params.id,
        },
        transaction,
      },
    )

    if (!rowsUpdated) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Organization not found'] })
    }

    publishEvent(routingKeys.ORG_UPDATED, {
      user_id: req.user.id,
      organization_id: req.params.id,
      meta: updated,
    })
  }

  await transaction.commit()

  const organization = await models.Organization.findByPk(req.params.id, {
    attributes: { exclude: _exclude },
    include: [{
      model: models.Address,
      attributes: {
        exclude: excludeFields,
      },
    }],
  })

  return res.status(HTTPStatus.OK).send(organization)
}

const getAllMembers = async (req, res) => {
  const members = await models.UserOrganization.findMembers(req.params.id, models)

  return res.status(HTTPStatus.OK).send(members)
}

const getPendingInvites = async (req, res) => {
  const list = await models.InviteOrganization.findAll({
    where: {
      org_id: req.params.id,
      status: 'pending',
    },
    attributes: ['email'],
  })

  return res.status(HTTPStatus.OK).send(list)
}

const listPublishers = async (req, res) => {
  const publishers = await models.Organization.findAll({
    include: [{
      model: models.App,
      where: {
        visibility: 'public',
        enable: true,
      },
      attributes: [],
    }],
    attributes: [
      'id',
      'name',
    ],
    order: [['name', 'asc']],
  })

  return res.status(HTTPStatus.OK).json(publishers)
}

const getPublisher = async (req, res) => {
  const publisher = await models.Organization.findOne({
    include: [{
      model: models.App,
      where: {
        org_id: req.params.id,
        visibility: 'public',
        enable: true,
      },
      attributes: [],
    }],
    attributes: [
      'id',
      'name',
      'logo',
      'description',
      'privacyUrl',
      'youtubeUrl',
      'websiteUrl',
      'supportUrl',
    ],
  })

  if (!publisher) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Publisher not found'] })
  }

  return res.status(HTTPStatus.OK).json(publisher)
}

const removeUserFromOrganization = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const orgId = Number(req.params.id)
    const userId = Number(req.params.userId)

    const userOrg = req.user.organizations.find((o) => o.id === orgId)
    if (!userOrg || (userOrg.role.name === roles.DEVELOPER && userId !== req.user.id)) {
      await transaction.rollback()
      return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Not allowed'] })
    }

    // if admin or org owner and removing itself
    if (userOrg.role.name !== roles.DEVELOPER && userId === req.user.id) {
      const orgUserCount = await models.UserOrganization.count({
        where: {
          user_id: {
            [Op.ne]: userId,
          },
          org_id: orgId,
          role_id: userOrg.role.id,
        },
      }, { transaction })

      if (orgUserCount === 0) {
        await transaction.rollback()
        return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Not allowed'] })
      }
    }

    const userOrgs = await models.UserOrganization.findAll({
      where: { user_id: userId },
      raw: true,
    }, transaction)

    await models.UserOrganization.destroy({
      where: {
        user_id: userId,
        org_id: orgId,
      },
    }, transaction)

    const deletedOrg = userOrgs.find((o) => o.org_id === orgId)
    if (deletedOrg.current_org) {
      const nextCurrentOrg = userOrgs.find((o) => o.org_id !== orgId)

      if (nextCurrentOrg) {
        await models.UserOrganization.update(
          { current_org: true },
          {
            where: {
              user_id: userId,
              org_id: nextCurrentOrg.org_id,
            },
            transaction,
          },
        )
      }
    }

    await transaction.commit()
    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    if (transaction) await transaction.rollback()
    return Promise.reject(error)
  }
}

const changeUserRole = async (req, res) => {
  const orgId = Number(req.params.id)
  const userId = Number(req.params.userId)
  const roleId = Number(req.params.roleId)

  const reqUserOrg = req.user.organizations.find((o) => o.id === orgId)
  if (!reqUserOrg) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Not allowed'] })
  }

  if (userId === req.user.id) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Not allowed'] })
  }

  const transaction = await sequelize.transaction()
  try {
    let targetUser = await models.UserOrganization.findOne({
      where: {
        org_id: orgId,
        user_id: userId,
      },
      include: [{
        model: models.Role,
        as: 'Role',
        attributes: ['id', 'level'],
      }],
      transaction,
    })

    targetUser = targetUser.get({ plain: true })

    if (targetUser.Role.level < reqUserOrg.role.level) {
      await transaction.rollback()
      return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Not allowed'] })
    }

    const targetRole = await models.Role.findByPk(roleId, { transaction })
    if (!targetRole) {
      await transaction.rollback()
      return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Role not found'] })
    }

    if (targetRole.level < reqUserOrg.role.level) {
      await transaction.rollback()
      return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Not allowed'] })
    }

    await models.UserOrganization.update(
      { role_id: targetRole.id },
      {
        where: {
          user_id: userId,
          org_id: orgId,
        },
        transaction,
      },
    )

    await transaction.commit()
    return res.sendStatus(HTTPStatus.NO_CONTENT)
  } catch (error) {
    if (transaction) await transaction.rollback()
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to change user role.'] })
  }
}

module.exports = {
  getAll,
  getById,
  addOrg,
  deleteOrg,
  updateOrg,
  getAllMembers,
  getPendingInvites,
  listPublishers,
  getPublisher,
  removeUserFromOrganization,
  changeUserRole,
}
