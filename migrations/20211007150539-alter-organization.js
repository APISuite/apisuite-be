'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.sequelize.query('alter table organization drop constraint organization_address_id_fkey;')

    return queryInterface.changeColumn('organization', 'address_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'address',
        key: 'id',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('organization', 'address_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'address',
        key: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
  },
}
