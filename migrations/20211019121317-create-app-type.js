'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable('app_types', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        type: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
      }, { transaction })

      await queryInterface.addColumn('app', 'app_type_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'app_types',
          key: 'id',
        },
      }, { transaction })

      const [createdAppType] = await queryInterface.bulkInsert('app_types', [{ type: 'client' }], {
        transaction,
        returning: ['id'],
      })

      await queryInterface.sequelize.query(`UPDATE app SET app_type_id = ${createdAppType.id};`, { transaction })

      await queryInterface.changeColumn('app', 'app_type_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'app_types',
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
      await queryInterface.removeColumn('app', 'app_type_id', { transaction })
      await queryInterface.dropTable('app_types', { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },
}
