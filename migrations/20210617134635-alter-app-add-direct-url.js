'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('app', 'direct_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('app', 'direct_url')
  },
}
