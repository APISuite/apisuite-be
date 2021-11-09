'use strict'
const { models } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn('apis', 'api_docs', {
        type: Sequelize.JSON,
        defaultValue: {},
        allowNull: true,
      }, { transaction })

      const apiDocs = await models.Api.findAll({
        attributes: ['id', 'docs', 'apiDocs'],
        transaction,
      })

      for (let i = 0; i < apiDocs.length; i++) {
        if (apiDocs[i].dataValues.docs === null) {
          apiDocs[i].dataValues.docs = [Object()]
          await models.Api.update(
            { docs: apiDocs[i].dataValues.docs },
            {
              where: { id: apiDocs[i].dataValues.id },
              transaction,
            },
          )
        }
        if (apiDocs[i].dataValues.apiDocs === false) {
          apiDocs[i].dataValues.apiDocs = Object()
          await models.Api.update(
            { apiDocs: apiDocs[i].dataValues.apiDocs },
            {
              where: { id: apiDocs[i].dataValues.id },
              transaction,
            },
          )
        } else if (apiDocs[i].dataValues.apiDocs !== false) {
          await models.Api.update(
            { apiDocs: apiDocs[i].dataValues.apiDocs[0] },
            {
              where: { id: apiDocs[i].dataValues.id },
              transaction,
            },
          )
        }
      }
      await transaction.commit()
    } catch (err) {
      if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(err)
    }
  },
}
