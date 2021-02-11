'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('app_subscriptions', {
      app_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      sandbox_api_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sandbox_api',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      indexes: [
        { unique: true, fields: ['app_id', 'sandbox_api_id'] },
      ],
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('app_subscriptions')
  },
}
