'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('organization', 'tax_exempt', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
  },
}
