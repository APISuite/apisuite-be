'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      text: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      app_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app',
          key: 'id',
        },
      },
      puburl_apps_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'puburl_apps',
          key: 'id',
        },
      },
      sandbox_api_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sandbox_api',
          key: 'id',
        },
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
    return queryInterface.dropTable('messages')
  },
}
