'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable('subscription_plan', {
        type: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING,
        },
        plan: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
      }, { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.dropTable('subscription_plan', { transaction })
      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },
}
