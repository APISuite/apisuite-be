'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'last_login', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'last_login')
  },
}
