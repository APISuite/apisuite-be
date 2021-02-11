'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('apis', 'type', {
      type: Sequelize.ENUM('local', 'cloud'),
      defaultValue: 'cloud',
      allowNull: false,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('app', 'type')
  },
}
