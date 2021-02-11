'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('refresh_tokens', {
      token: {
        type: Sequelize.TEXT,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'cascade',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('refresh_tokens')
  },
}
