'use strict'

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

      for (const recordsToAddElement of recordsToAdd) {
        const typeExists = await queryInterface.select(null, 'app_types', { where: { type: recordsToAddElement.type } })
        if (!typeExists) {
          await queryInterface.insert(null, 'app_types', recordsToAddElement)
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
