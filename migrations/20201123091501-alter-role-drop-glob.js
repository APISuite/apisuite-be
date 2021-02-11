'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('role', 'glob_notation')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('role', 'glob_notation', {
      type: Sequelize.JSON(),
    })
  },
}
