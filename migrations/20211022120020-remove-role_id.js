'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query('alter table users drop constraint users_role_id_fkey;')

      await queryInterface.removeColumn('users', 'role_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'role',
          key: 'id',
        },
      }, { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('users', 'role_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'role',
          key: 'id',
        },
        defaultValue: 2,
        after: 'activation_token',
      })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },
}
