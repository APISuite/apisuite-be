'use strict'

const grants = {
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
    'update:any': ['*'],
    'delete:any': ['*'],
  },
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkUpdate('role', { grants: JSON.stringify(grants) }, { name: 'superadmin' })
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
