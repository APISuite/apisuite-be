'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('setup_token', {
      token: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('setup_token')
  },
}
