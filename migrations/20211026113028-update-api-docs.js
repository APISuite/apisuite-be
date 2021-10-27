'use strict'
const { models } = require('../models')

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.sequelize.query('CREATE TABLE public.api_docs_bck (id int ,docs text);')

      const apiDocs = await models.Api.findAll({
        attributes: ['id', 'docs'],
      })

      for (let i = 0; i < apiDocs.length; i++) {
        const apiDocsObj = [{
          productIntro: '',
          features: [{
            title: '',
            info: '',
            image: '',
          }],
          useCases: [{
            title: '',
            info: '',
            image: '',
          }],
          highlights: [{
            title: '',
            info: '',
            image: '',
          }],
        }]

        for (const key in apiDocs[i].dataValues.docs) {
          for (const key1 in apiDocs[i].dataValues.docs[key]) {
            switch (apiDocs[i].dataValues.docs[key][key1]) {
              case 'product_intro':
                apiDocsObj[0].productIntro = apiDocs[i].dataValues.docs[key].info
                break
              case 'feature':
                apiDocsObj[0].features[0].title = apiDocs[i].dataValues.docs[key].title
                apiDocsObj[0].features[0].info = apiDocs[i].dataValues.docs[key].info
                apiDocsObj[0].features[0].image = apiDocs[i].dataValues.docs[key].image
                break
              case 'use_case':
                apiDocsObj[0].useCases[0].title = apiDocs[i].dataValues.docs[key].title
                apiDocsObj[0].useCases[0].info = apiDocs[i].dataValues.docs[key].info
                apiDocsObj[0].useCases[0].image = apiDocs[i].dataValues.docs[key].image
                break
              case 'highlight':
                apiDocsObj[0].highlights[0].title = apiDocs[i].dataValues.docs[key].title
                apiDocsObj[0].highlights[0].info = apiDocs[i].dataValues.docs[key].info
                apiDocsObj[0].highlights[0].image = apiDocs[i].dataValues.docs[key].image
                break
            }
          }
        }

        await models.Api.update(
          { docs: apiDocsObj },
          {
            where: { id: apiDocs[i].dataValues.id },
            transaction,
          },
        )
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
