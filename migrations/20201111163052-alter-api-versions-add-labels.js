'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('api_versions', 'scope', { transaction })
      await queryInterface.removeColumn('api_versions', 'sandbox_enabled', { transaction })
      await queryInterface.removeColumn('api_versions', 'production_enabled', { transaction })

      await queryInterface.addColumn('api_versions', 'live', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction })

      await queryInterface.addColumn('api_versions', 'deprecated', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (error) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('api_versions', 'live', { transaction })
      await queryInterface.removeColumn('api_versions', 'deprecated', { transaction })

      return Promise.resolve()
    } catch (error) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(error)
    }
  },
}
