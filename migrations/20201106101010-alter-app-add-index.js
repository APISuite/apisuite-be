'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('app', ['client_id'], { name: 'idx_app_client_id' })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('app', 'idx_app_client_id')
  },
}
