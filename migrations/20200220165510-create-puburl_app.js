'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('puburl_apps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      app_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app',
          key: 'id',
        },
      },
      type: {
        type: Sequelize.ENUM('client', 'tos'),
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

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.dropTable('puburl_apps', { transaction: t })
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_puburl_apps_type";', { transaction: t })
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
