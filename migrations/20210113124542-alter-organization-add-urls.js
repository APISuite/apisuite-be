'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('organization', 'tos_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('organization', 'privacy_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('organization', 'youtube_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('organization', 'website_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('organization', 'support_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.sequelize.query('UPDATE organization SET website_url = website;')
    return queryInterface.sequelize.query('UPDATE organization SET terms = terms;')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('organization', 'tos_url')
    await queryInterface.removeColumn('organization', 'privacy_url')
    await queryInterface.removeColumn('organization', 'youtube_url')
    await queryInterface.removeColumn('organization', 'website_url')
    return queryInterface.removeColumn('organization', 'support_url')
  },
}
