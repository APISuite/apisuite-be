'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('sso_clients', {
      provider: {
        type: Sequelize.ENUM('keycloak'),
        allowNull: false,
        primaryKey: true,
      },
      client_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      client_secret: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      client_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('sso_clients')
  },
}
