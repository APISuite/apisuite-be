'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('settings_storefronts', {
      name: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
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

  down: (queryInterface) => { return queryInterface.dropTable('settings_storefronts') },
}
