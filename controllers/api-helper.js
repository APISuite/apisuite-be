const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const { models, sequelize } = require('../models')

const createAPIHandler = async (apiData) => {
  const transaction = await sequelize.transaction()
  try {
    const apiFound = await models.Api.findOne({
      where: {
        name: apiData.name,
      },
      transaction,
    })

    if (apiFound) {
      log.info(`API "${apiData.name}" already exists`)
      return {
        status: HTTPStatus.BAD_REQUEST,
        errors: ['API name already exists.'],
      }
    }

    const api = await models.Api.create({
      name: apiData.name,
      baseUri: apiData.baseUri,
      baseUriSandbox: apiData.baseUriSandbox,
      docs: apiData.docs,
      apiDocs: apiData.apiDocs,
      type: apiData.type,
    }, { transaction })

    await transaction.commit()
    return {
      status: HTTPStatus.CREATED,
      api,
    }
  } catch (error) {
    await transaction.rollback()
    log.error(error, '[CREATE API]')
    return {
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      errors: ['API failed to be created.'],
    }
  }
}

module.exports = {
  createAPIHandler,
}
