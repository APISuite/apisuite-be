'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('organization', 'address_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'address',
        key: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('organization', 'address_id')
  },
}
