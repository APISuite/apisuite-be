'use strict'

const migrateRoutes = async (queryInterface, transaction) => {
  const apis = await queryInterface.sequelize.query('SELECT id, route FROM "sandbox_api";', { transaction })

  let routes = apis.map((api) => {
    const pattern = /{.*}/gi
    let r = []
    if (api.route && api.route.length > 0) {
      r = api.route.map((route) => {
        return {
          api_id: api.id,
          route: `^${route.replace(pattern, '.*')}$`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    }
    return r
  })
  routes = [].concat.apply([], routes)

  if (routes.length) {
    await queryInterface.bulkInsert('routes', routes)
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable('routes', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        api_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'sandbox_api',
            key: 'id',
          },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
        route: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { transaction })

      await migrateRoutes(queryInterface, transaction)

      await queryInterface.addColumn('sandbox_api', 'spec', {
        type: Sequelize.JSON,
        allowNull: false,
      }, { transaction })
      await queryInterface.removeColumn('sandbox_api', 'route', { transaction })
      await transaction.commit()
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
      await queryInterface.addColumn('sandbox_api', 'route', {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      }, { transaction })

      await queryInterface.removeColumn('sandbox_api', 'spec', { transaction })
      await queryInterface.dropTable('routes', { transaction })

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
