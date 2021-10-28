const HTTPStatus = require('http-status-codes')
const path = require('path')
const log = require('../util/logger')
const SwaggerParser = require('@apidevtools/swagger-parser')
const { v4: uuidv4 } = require('uuid')
const enums = require('../util/enums')
const emailService = require('../services/email')
const { models, sequelize } = require('../models')

const get = async (req, res) => {
  const org = await models.Organization.getOwnerOrganization()
  if (!org) {
    return res.status(HTTPStatus.NOT_FOUND).send({ errors: ['Owner organization does not exist.'] })
  }

  return res.status(HTTPStatus.OK).send(org)
}

const setup = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const org = await models.Organization.create({
      name: req.body.organization.name,
      websiteUrl: req.body.organization.website,
      vat: req.body.organization.vat,
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

    if (req.body.portalSettings) {
      await models.Setting.create({
        type: enums.settingTypes.PORTAL,
        values: req.body.portalSettings,
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

    const ownerOrg = await models.Organization.getOwnerOrganization()
    await emailService.sendInviteNewUserToOrg(invitationData, { logo: ownerOrg?.logo })

    await transaction.commit()

    return res.status(HTTPStatus.OK).send(invite)
  } catch (error) {
    if (transaction) await transaction.rollback()
    // restore the setup token so the operation can be retried
    await sequelize.query('UPDATE setup_token SET used = false;')

    log.error(error, '[OWNER setupMainAccount]')
    return res.sendInternalError()
  }
}

module.exports = {
  get,
  setup,
}
