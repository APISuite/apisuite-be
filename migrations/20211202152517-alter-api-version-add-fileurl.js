'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('api_versions', 'spec_file', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('api_versions', 'spec_file')
  },
}
