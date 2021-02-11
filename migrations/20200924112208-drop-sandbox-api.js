'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.removeColumn('app_subscriptions', 'sandbox_api_id', { transaction: t })
        await queryInterface.dropTable('routes', { transaction: t })
        await queryInterface.dropTable('sandbox_api', { transaction: t })
        return Promise.resolve()
      } catch (error) {
        if (t) {
          await t.rollback()
        }
        return Promise.reject(error)
      }
    })
  },

  down: async (queryInterface, Sequelize) => {},
}
