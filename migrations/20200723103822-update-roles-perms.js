'use strict'

const superadminRole = {
  name: 'superadmin',
  grants: [
    { resource: '*', action: '*', attributes: ['*'] },
  ],
}

const adminRole = {
  name: 'admin',
  grants: [
    {
      resource: 'profile',
      action: '*',
      attributes: ['*'],
      condition: {
        Fn: 'EQUALS',
        args: { category: 'org', requester: '$.owner' },
      },
    },
    {
      resource: 'api',
      action: ['read'],
      attributes: ['*'],
    },
  ],
}

const developerRole = {
  name: 'developer',
  grants: [
    {
      resource: 'profile',
      action: ['readOwn', 'updateOwn', 'deleteOwn', 'readAny'],
      attributes: ['*'],
      condition: {
        Fn: 'EQUALS',
        args: {
          category: 'org',
          requester: '$.owner',
        },
      },
    },
    {
      resource: 'api',
      action: ['read'],
      attributes: ['*'],
    },
  ],
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query(
        `UPDATE role SET glob_notation = '${JSON.stringify(superadminRole)}' WHERE name = 'superadmin';`,
        { transaction },
      )

      await queryInterface.sequelize.query(
        `UPDATE role SET glob_notation = '${JSON.stringify(adminRole)}' WHERE name = 'admin';`,
        { transaction },
      )

      await queryInterface.sequelize.query(
        `UPDATE role SET glob_notation = '${JSON.stringify(developerRole)}' WHERE name = 'developer';`,
        { transaction },
      )

      await transaction.commit()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },

  down: (queryInterface, Sequelize) => {
    // return promise so that down script won't break
    return Promise.resolve()
  },
}
