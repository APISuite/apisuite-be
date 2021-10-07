'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('organization', 'address_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'address',
        key: 'id',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('organization', 'address_id')
  },
}
