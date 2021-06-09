'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('app_metadata', {
      key: {
        type: Sequelize.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      app_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'app',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('app_metadata')
  },
}
