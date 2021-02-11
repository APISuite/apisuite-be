'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('app', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      redirect_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visibility: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'private',
      },
      logo: {
        type: Sequelize.STRING,
      },
      client_data: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      enable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
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
    return queryInterface.dropTable('app')
  },
}
