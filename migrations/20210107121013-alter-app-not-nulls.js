'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE app ALTER COLUMN client_data DROP NOT NULL;')
    return queryInterface.sequelize.query('ALTER TABLE app ALTER COLUMN visibility DROP NOT NULL;')
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
