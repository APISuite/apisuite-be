'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('app', 'org_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organization',
          key: 'id',
        },
      }, { transaction })

      await queryInterface.removeColumn('app', 'user_id', { transaction })

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
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('app', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        defaultValue: 1,
      }, { transaction })

      await queryInterface.removeColumn('app', 'org_id', { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },
}
