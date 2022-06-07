'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('pages', 'online', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction })
      await queryInterface.addColumn('pages', 'title', {
        type: Sequelize.TEXT,
        allowNull: true,
      }, { transaction })
      await queryInterface.addColumn('pages', 'parent', {
        type: Sequelize.TEXT,
      }, { transaction })
      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('pages', 'online', { transaction })
      await queryInterface.removeColumn('pages', 'title', { transaction })
      await queryInterface.removeColumn('pages', 'parent', { transaction })
      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },
}
