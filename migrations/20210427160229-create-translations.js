'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('translations', {
      locale: {
        type: Sequelize.TEXT,
        primaryKey: true,
      },
      translations: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    })

    return queryInterface.bulkInsert('translations', [{
      locale: 'en-US',
      translations: JSON.stringify({}),
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('translations')
  },
}
