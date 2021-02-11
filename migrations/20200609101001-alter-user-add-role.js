'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'role',
        key: 'id',
      },
      defaultValue: 2,
      after: 'activation_token',
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'role_id')
  },
}
