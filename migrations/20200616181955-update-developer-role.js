'use strict'

const grant = {
  role: 'developer',
  action: ['readOwn', 'updateOwn', 'deleteOwn', 'readAny'],
  resource: 'profile',
  condition: { Fn: 'EQUALS', args: { category: 'org', requester: '$.owner' } },
  attributes: ['*'],
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `UPDATE role SET glob_notation = '${JSON.stringify(grant)}' WHERE glob_notation ->> 'role' = '${grant.role}';`,
    )
  },

  down: (queryInterface, Sequelize) => {
    // return promise so that down script won't break
    return Promise.resolve()
  },
}
