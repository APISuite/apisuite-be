'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_organization', 'current_org', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_organization', 'current_org')
  },
}
