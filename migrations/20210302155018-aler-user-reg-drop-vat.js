'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE user_registration DROP COLUMN organization_vat')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE app ADD COLUMN organization_vat VARCHAR(255) ')
  },
}
