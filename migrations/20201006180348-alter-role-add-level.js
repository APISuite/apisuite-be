'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.addColumn('role', 'level', {
          type: Sequelize.INTEGER,
          defaultValue: 999,
          allowNull: false,
        })
        await queryInterface.bulkUpdate('role', { level: 1 }, { name: 'superadmin' }, { transaction: t })
        await queryInterface.bulkUpdate('role', { level: 2 }, { name: 'admin' }, { transaction: t })
        await queryInterface.bulkUpdate('role', { level: 3 }, { name: 'developer' }, { transaction: t })
        return Promise.resolve()
      } catch (error) {
        if (t) {
          await t.rollback()
        }
        return Promise.reject(error)
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('role', 'level')
  },
}
