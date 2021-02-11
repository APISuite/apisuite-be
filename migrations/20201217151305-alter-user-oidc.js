'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL;')

    await queryInterface.removeConstraint('password_recovery', 'password_recovery_user_id_fkey')
    await queryInterface.addConstraint('password_recovery', {
      name: 'password_recovery_user_id_fkey',
      type: 'foreign key',
      fields: ['user_id'],
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
    })

    await queryInterface.addColumn('users', 'oidc_provider', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    return queryInterface.addColumn('users', 'oidc_id', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'oidc_provider')
    return queryInterface.removeColumn('users', 'oidc_id')
  },
}
