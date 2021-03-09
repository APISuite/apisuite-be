'use strict'

const ENUM_TYPE_NAME = 'enum_puburl_apps_type'

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query(`ALTER TYPE ${ENUM_TYPE_NAME} RENAME TO ${ENUM_TYPE_NAME}_old;`, { transaction })
      await queryInterface.sequelize.query(`CREATE TYPE ${ENUM_TYPE_NAME} AS ENUM ('client', 'tos', 'policy', 'support', 'support_email');`, { transaction })
      await queryInterface.sequelize.query(`ALTER TABLE puburl_apps ALTER COLUMN type TYPE ${ENUM_TYPE_NAME} USING type::text::${ENUM_TYPE_NAME};`, { transaction })
      await queryInterface.sequelize.query(`DROP TYPE ${ENUM_TYPE_NAME}_old;`, { transaction })
      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query(`ALTER TYPE ${ENUM_TYPE_NAME} RENAME TO ${ENUM_TYPE_NAME}_old;`, { transaction })
      await queryInterface.sequelize.query(`CREATE TYPE ${ENUM_TYPE_NAME} AS ENUM('client', 'tos');`, { transaction })
      await queryInterface.sequelize.query(`ALTER TABLE puburl_apps ALTER COLUMN type TYPE ${ENUM_TYPE_NAME} USING type::text::${ENUM_TYPE_NAME};`, { transaction })
      await queryInterface.sequelize.query(`DROP TYPE ${ENUM_TYPE_NAME}_old;`, { transaction })
      await transaction.commit()
      return Promise.resolve()
    } catch (err) {
      await transaction.rollback()
      return Promise.reject(err)
    }
  },
}
