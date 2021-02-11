'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('app', 'idp_provider', {
      type: Sequelize.ENUM('Internal', 'Keycloak'),
      defaultValue: 'Internal',
      allowNull: false,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('app', 'idp_provider')
  },
}
