'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('user_organization', ['user_id'], { name: 'idx_user_organization_user_id' })
    return queryInterface.addIndex('user_organization', ['org_id'], { name: 'idx_user_organization_org_id' })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('user_organization', 'idx_user_organization_user_id')
    return queryInterface.removeIndex('user_organization', 'idx_user_organization_org_id')
  },
}
