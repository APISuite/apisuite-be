'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query('ALTER TABLE settings DROP CONSTRAINT settings_pkey;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE settings ADD PRIMARY KEY (type);', { transaction })
      await queryInterface.sequelize.query('INSERT INTO settings (type, values, created_at, updated_at) values (\'plan\', \'{}\', now(), now()) ON CONFLICT DO NOTHING;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE settings DROP COLUMN id;', { transaction })

      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
