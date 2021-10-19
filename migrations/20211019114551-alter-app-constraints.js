'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn('app', 'images', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      }, { transaction })

      await queryInterface.changeColumn('app', 'labels', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: [],
      }, { transaction })

      await queryInterface.changeColumn('app', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      }, { transaction })

      await queryInterface.changeColumn('app', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      }, { transaction })

      await queryInterface.changeColumn('app', 'redirect_url', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (error) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn('app', 'images', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: null,
      }, { transaction })

      await queryInterface.changeColumn('app', 'labels', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: null,
      }, { transaction })

      await queryInterface.changeColumn('app', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: null,
      }, { transaction })

      await queryInterface.changeColumn('app', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: null,
      }, { transaction })

      await queryInterface.changeColumn('app', 'redirect_url', {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (error) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(error)
    }
  },
}
