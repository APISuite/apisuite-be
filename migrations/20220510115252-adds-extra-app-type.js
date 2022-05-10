'use strict'
const { models } = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      const recordsToAdd = [
        { type: 'blueprint', enabled: true },
        { type: 'connector', enabled: false },
        { type: 'external', enabled: false },
        { type: 'expert', enabled: false },
      ]

      for (const record of recordsToAdd) {
        const typeExists = models.AppType.findOne({ where: { type: record.type } })
        if (!typeExists) {
          await models.AppType.create(record, { transaction })
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
