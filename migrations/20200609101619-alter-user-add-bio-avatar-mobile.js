'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('users', 'bio', {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction },
      )
      await queryInterface.addColumn('users', 'avatar', {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction },
      )
      await queryInterface.addColumn('users', 'mobile',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      )
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
      await queryInterface.removeColumn('users', 'bio', { transaction })
      await queryInterface.removeColumn('users', 'avatar', { transaction })
      await queryInterface.removeColumn('users', 'mobile', { transaction })
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
