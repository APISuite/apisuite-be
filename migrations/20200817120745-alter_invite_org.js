'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('invite_organization', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('invite_organization', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },
}
