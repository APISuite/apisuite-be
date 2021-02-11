'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('account'),
      },
      values: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.dropTable('settings', { transaction: t })
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_settings_type";', { transaction: t })
        return Promise.resolve()
      } catch (error) {
        if (t) {
          await t.rollback()
        }
        return Promise.reject(error)
      }
    })
  },
}
