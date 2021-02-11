'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('app', 'urls')
    await queryInterface.addColumn('app', 'tos_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('app', 'privacy_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('app', 'youtube_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('app', 'website_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    return queryInterface.addColumn('app', 'support_url', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('app', 'tos_url')
    await queryInterface.removeColumn('app', 'privacy_url')
    await queryInterface.removeColumn('app', 'youtube_url')
    await queryInterface.removeColumn('app', 'website_url')
    await queryInterface.removeColumn('app', 'support_url')
    return queryInterface.addColumn('app', 'urls', {
      type: Sequelize.JSONB,
      allowNull: true,
    })
  },
}
