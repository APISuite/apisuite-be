'use strict'

const grants = {
  superadmin: {
    api: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    app: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    organization: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    profile: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    settings: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
  },
  admin: {
    api: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    app: {
      'create:own': ['*'],
      'read:own': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    organization: {
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    profile: {
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    settings: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
  },
  organizationOwner: {
    api: {
      'read:any': ['*'],
    },
    app: {
      'create:own': ['*'],
      'read:own': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    organization: {
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    profile: {
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
  },
  developer: {
    api: {
      'read:any': ['*'],
    },
    app: {
      'create:own': ['*'],
      'read:own': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    organization: {
      'read:any': ['*'],
    },
    profile: {
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
  },
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.addColumn('role', 'grants', {
          type: Sequelize.JSON,
          defaultValue: JSON.stringify({}),
          allowNull: false,
        }, { transaction: t })
        await queryInterface.bulkUpdate('role', { grants: JSON.stringify(grants.superadmin) }, { name: 'superadmin' }, { transaction: t })
        await queryInterface.bulkUpdate('role', { grants: JSON.stringify(grants.admin) }, { name: 'admin' }, { transaction: t })
        await queryInterface.bulkUpdate('role', { grants: JSON.stringify(grants.developer), level: 4 }, { name: 'developer' }, { transaction: t })
        await queryInterface.bulkInsert('role', [{
          name: 'organizationOwner',
          glob_notation: JSON.stringify({}),
          grants: JSON.stringify(grants.organizationOwner),
          level: 3,
          created_at: new Date(),
          updated_at: new Date(),
        }], { transaction: t })
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
    return queryInterface.removeColumn('role', 'grants')
  },
}
