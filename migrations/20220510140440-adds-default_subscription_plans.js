'use strict'
const { models } = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      const recordsToAdd = [
        { type: 'starter', plan: JSON.stringify({ blueprintApps: 1, marketplace: true, synchronizations: 7200 }) },
        { type: 'portal', plan: JSON.stringify({ blueprintApps: 0, marketplace: false, synchronizations: 7200 }) },
        { type: 'marketplace', plan: JSON.stringify({ blueprintApps: Number.MAX_SAFE_INTEGER, marketplace: true, synchronizations: 86400 }) },
      ]

      for (const record of recordsToAdd) {
        const resourceExists = await models.Plan.findOne({ where: { type: record.type } })
        if (!resourceExists) {
          await queryInterface.insert(null, 'subscription_plan', record)
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
