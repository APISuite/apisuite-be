'use strict'

const crypto = require('../util/crypto')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      try {
        await queryInterface.addColumn('app', 'client_id', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction: t })
        await queryInterface.addColumn('app', 'client_secret', {
          type: Sequelize.TEXT,
          allowNull: true,
        }, { transaction: t })
        await queryInterface.sequelize.query(
          'UPDATE app SET client_id = (client_data->>\'client_id\');',
          { transaction: t },
        )

        const res = await queryInterface.sequelize.query(
          'SELECT id, client_data->>\'client_secret\' as secret FROM app;',
          { transaction: t },
        )
        const appSecrets = res[0]

        for (const app of appSecrets) {
          const encryptedSecret = crypto.cipher(app.secret)

          await queryInterface.sequelize.query(
            'UPDATE app SET client_secret = ? WHERE id = ?;',
            {
              replacements: [encryptedSecret, app.id],
              transaction: t,
            },
          )
        }

        await queryInterface.sequelize.query(
          'UPDATE app SET client_data = client_data::jsonb - \'client_id\' - \'client_secret\'',
          { transaction: t },
        )

        return Promise.resolve()
      } catch (error) {
        if (t) {
          await t.rollback()
        }
        return Promise.reject(error)
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  },
}
