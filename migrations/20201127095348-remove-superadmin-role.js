'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query(`
        UPDATE users SET role_id = (
          SELECT id FROM role WHERE name = 'admin'
        ) WHERE role_id = (
          SELECT id FROM role WHERE name = 'superadmin'
        );`, { transaction })

      await queryInterface.sequelize.query(`
        UPDATE user_organization SET role_id = (
          SELECT id FROM role WHERE name = 'admin'
        ) WHERE role_id = (
          SELECT id FROM role WHERE name = 'superadmin'
        );`, { transaction })

      await queryInterface.sequelize.query(`
        DELETE FROM role WHERE name = 'superadmin';
      `, { transaction })

      await transaction.commit()
    } catch (error) {
      if (transaction) await transaction.rollback()
      return Promise.reject(error)
    }
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
