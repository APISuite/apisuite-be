'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('functions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      microservice_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ms_service_name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      ms_host_name: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('functions')
  },
}
