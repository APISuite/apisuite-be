'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('puburl_apps')
  },

  down: (queryInterface, Sequelize) => {},
}
