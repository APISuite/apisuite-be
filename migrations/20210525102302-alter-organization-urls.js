'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('UPDATE organization SET website_url = website WHERE website_url IS NULL;')
    await queryInterface.sequelize.query('UPDATE organization SET tos_url = terms WHERE tos_url IS NULL;')
    await queryInterface.removeColumn('organization', 'website')
    return queryInterface.removeColumn('organization', 'terms')
  },

  down: async (queryInterface, Sequelize) => {},
}
