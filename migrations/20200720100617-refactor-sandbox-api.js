'use strict'

const migrateAPIs = async (queryInterface, transaction) => {
  const sboxAPIs = await queryInterface.sequelize.query('SELECT id, name, api_title, version, spec FROM "sandbox_api";', { transaction })

  for (const api of sboxAPIs[0]) {
    const newAPI = {
      name: api.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const [createdAPI] = await queryInterface.bulkInsert('apis', [newAPI], { transaction, returning: ['id'] })

    if (createdAPI && createdAPI.id) {
      const newAPIversion = {
        api_id: createdAPI.id,
        title: api.api_title,
        version: api.version,
        spec: JSON.stringify(api.spec),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const [createdVersion] = await queryInterface.bulkInsert('api_versions', [newAPIversion], { transaction, returning: ['id'] })

      const oldRoutes = await queryInterface.sequelize.query(`SELECT route FROM "routes" WHERE api_id = ${api.id};`, { transaction })
      if (oldRoutes && oldRoutes.length) {
        const routes = oldRoutes[0].map((route) => {
          return {
            api_version_id: createdVersion.id,
            route: route.route,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })

        if (routes.length) {
          await queryInterface.bulkInsert('api_version_routes', routes, { transaction })
        }
      }
    }
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable('apis', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        base_uri: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        base_uri_sandbox: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        docs: {
          type: Sequelize.JSON,
          allowNull: true,
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

      await queryInterface.createTable('api_versions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        api_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'apis',
            key: 'id',
          },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        version: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        spec: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        scope: {
          type: Sequelize.ENUM('public', 'private', 'draft'),
          allowNull: false,
          defaultValue: 'draft',
        },
        production_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        sandbox_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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

      await queryInterface.createTable('api_version_routes', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        api_version_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'api_versions',
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

      await migrateAPIs(queryInterface, transaction)

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
      await queryInterface.dropTable('api_version_routes', { transaction })
      await queryInterface.dropTable('api_versions', { transaction })
      await queryInterface.dropTable('apis', { transaction })

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
