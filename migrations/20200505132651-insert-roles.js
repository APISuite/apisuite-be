'use strict'

const grants = [
  {
    role: 'superadmin',
    action: '*',
    resource: '*',
    condition: { Fn: 'EQUALS', args: { requester: '$.owner' } },
    attributes: ['*'],
  },
  {
    role: 'admin',
    action: '*',
    resource: 'profile',
    condition: { Fn: 'EQUALS', args: { category: 'org', requester: '$.owner' } },
    attributes: ['*'],
  },
  {
    role: 'developer',
    action: ['readOwn', 'updateOwn', 'deleteOwn', 'readAny'],
    resource: 'profile',
    condition: { Fn: 'EQUALS', args: { category: 'org', requester: '$.owner' } },
    attributes: ['*'],
  },
]

module.exports = {
  up: (queryInterface, Sequelize) => {
    const inserts = []
    for (const grant of grants) {
      inserts.push({
        name: grant.role,
        glob_notation: JSON.stringify(grant),
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    return queryInterface.bulkInsert('role', inserts)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('role')
  },
}
