'use strict'

const migrateSubscriptions = (queryInterface, transaction) => {
  return queryInterface.sequelize.query(`
    UPDATE app_subscriptions SET api_id = (
      SELECT id FROM apis WHERE name = (
        SELECT name FROM sandbox_api WHERE id = sandbox_api_id
      )
    );`, { transaction })
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('app_subscriptions', 'api_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'apis',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }, { transaction })

      await migrateSubscriptions(queryInterface, transaction)

      await queryInterface.changeColumn('app_subscriptions', 'api_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'apis',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }, { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('app_subscriptions', 'api_id')

      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },
}
