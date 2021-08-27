'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE users ALTER COLUMN last_login DROP NOT NULL;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE users ALTER COLUMN last_login SET NOT NULL;')
  },
}
