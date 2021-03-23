'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('app', 'labels', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
      default: [],
    })
    await queryInterface.sequelize.query('UPDATE app SET labels = \'{}\';')
    await queryInterface.changeColumn('app', 'labels', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: false,
      default: [],
    })
    return queryInterface.addIndex('app', ['labels'], { using: 'gin' })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('app', 'labels')
  },
}
