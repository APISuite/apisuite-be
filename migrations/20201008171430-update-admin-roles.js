'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.sequelize.query(
          `UPDATE users 
          SET role_id = (SELECT id FROM role where name = 'organizationOwner')
          WHERE role_id = (SELECT id FROM role where name = 'admin');`,
          { transaction: t })

        await queryInterface.sequelize.query(
          `UPDATE user_organization 
          SET role_id = (SELECT id FROM role where name = 'organizationOwner')
          WHERE role_id = (SELECT id FROM role where name = 'admin');`,
          { transaction: t })

        return Promise.resolve()
      } catch (error) {
        if (t) await t.rollback()
        return Promise.reject(error)
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.sequelize.query(
          `UPDATE users 
          SET role_id = (SELECT id FROM role where name = 'admin')
          WHERE role_id = (SELECT id FROM role where name = 'organizationOwner');`,
          { transaction: t })

        await queryInterface.sequelize.query(
          `UPDATE user_organization 
          SET role_id = (SELECT id FROM role where name = 'admin')
          WHERE role_id = (SELECT id FROM role where name = 'organizationOwner');`,
          { transaction: t })

        return Promise.resolve()
      } catch (error) {
        if (t) await t.rollback()
        return Promise.reject(error)
      }
    })
  },
}
