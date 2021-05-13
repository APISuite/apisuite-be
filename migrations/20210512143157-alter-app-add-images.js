'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('app', 'images', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
      default: [],
    })
    await queryInterface.sequelize.query('UPDATE app SET images = \'{}\';')
    return queryInterface.changeColumn('app', 'images', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: false,
      default: [],
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('app', 'images')
  },
}
