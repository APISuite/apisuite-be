'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_registration', {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organization_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      organization_vat: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      organization_website: {
        type: Sequelize.STRING,
        allowNull: true,
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
    return queryInterface.dropTable('user_registration')
  },
}
