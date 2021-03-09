'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE app ADD COLUMN short_description VARCHAR(60);')
    return queryInterface.sequelize.query('ALTER TABLE app ALTER COLUMN description TYPE TEXT;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE app DROP COLUMN short_description')
  },
}
