'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('apis', 'published_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('apis', 'published_at')
  },
}
