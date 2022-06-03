'use strict'
const { models } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.removeConstraint('translations', 'translations_pkey')
      await queryInterface.addColumn('translations', 'extension', {
        type: Sequelize.TEXT,
        allowNull: true,
      })

      const translation = await models.Translation.findAll()

      for (const locale in translation) {
        await queryInterface.sequelize.query(`UPDATE translations SET extension = 'core' WHERE locale = '${translation[locale].dataValues.locale}';`, { transaction })
      }
      await transaction.commit()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.addConstraint('translations', {
        fields: ['locale'],
        type: 'primary key',
        name: 'translations_pkey',
      })

      await queryInterface.removeColumn('translations', 'extension')
    } catch (err) {
      return Promise.reject(err)
    }
  },
}
