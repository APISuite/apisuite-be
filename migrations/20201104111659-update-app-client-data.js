'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'UPDATE app SET client_data = (client_data->\'client\') WHERE (client_data->\'error\') is not null;',
    )
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
