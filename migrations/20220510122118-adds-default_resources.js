'use strict'
const { models } = require('../models')
const config = require('../config')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      const organization = await models.Organization.getOwnerOrganization()
      const recordsToAdd = [
        { org_id: organization.id, url: `${config.get('apiURL')}/media/space-background.svg`, namespace: 'marketplace.background', language: 'en-US' },
        { org_id: organization.id, url: `${config.get('apiURL')}/media/marketplace.svg`, namespace: 'marketplace.hero', language: 'en-US' },
        { org_id: organization.id, url: `${config.get('apiURL')}/media/marketplaceApps.svg`, namespace: 'marketplace.apps', language: 'en-US' },
      ]

      for (const record of recordsToAdd) {
        const resourceExists = await models.Resource.findByNamespace(record.org_id, record.namespace, record.language)
        if (!resourceExists) {
          await queryInterface.insert(null, 'resource', record)
        }
      }

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },
}
