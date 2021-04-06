'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TYPE enum_settings_type ADD VALUE IF NOT EXISTS \'theme\';')
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
