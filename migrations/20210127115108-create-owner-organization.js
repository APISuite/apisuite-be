'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE owner_organization (
        organization_id INT PRIMARY KEY REFERENCES organization
      );`)

    await queryInterface.sequelize.query('CREATE UNIQUE INDEX owner_organization_singleton ON owner_organization ((true));')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('owner_organization')
  },
}
