'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query(
        'CREATE TYPE enum_app_idp_provider_temp AS ENUM (\'Internal\', \'Keycloak\', \'internal\', \'keycloak\');',
        { transaction })
      await queryInterface.sequelize.query(
        'ALTER TABLE app ALTER COLUMN idp_provider DROP DEFAULT;',
        { transaction })
      await queryInterface.sequelize.query(
        'ALTER TABLE app ALTER COLUMN idp_provider SET DATA TYPE enum_app_idp_provider_temp USING idp_provider::text::enum_app_idp_provider_temp;',
        { transaction })
      await queryInterface.sequelize.query(
        'UPDATE app SET idp_provider = \'internal\' WHERE idp_provider = \'Internal\';',
        { transaction })
      await queryInterface.sequelize.query(
        'UPDATE app SET idp_provider = \'keycloak\' WHERE idp_provider = \'Keycloak\';',
        { transaction })
      await queryInterface.sequelize.query(
        'DROP TYPE enum_app_idp_provider;',
        { transaction })
      await queryInterface.sequelize.query(
        'CREATE TYPE enum_app_idp_provider AS ENUM (\'internal\', \'keycloak\');',
        { transaction })
      await queryInterface.sequelize.query(
        'ALTER TABLE app ALTER COLUMN idp_provider SET DATA TYPE enum_app_idp_provider USING idp_provider::text::enum_app_idp_provider;',
        { transaction })
      await queryInterface.sequelize.query(
        'ALTER TABLE app ALTER COLUMN idp_provider SET DEFAULT \'internal\'',
        { transaction })
      await queryInterface.sequelize.query(
        'DROP TYPE enum_app_idp_provider_temp;',
        { transaction })

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
