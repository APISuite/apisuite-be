'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('app', 'state', {
      type: Sequelize.ENUM('draft', 'pending', 'approved'),
      defaultValue: 'draft',
      allowNull: false,
    })
    return queryInterface.addColumn('app', 'urls', {
      type: Sequelize.JSONB,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('app', 'urls')
    return queryInterface.removeColumn('app', 'state')
  },
}
