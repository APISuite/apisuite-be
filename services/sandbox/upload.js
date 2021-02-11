const fs = require('fs')
const url = require('url')
const fetch = require('node-fetch')
const HTTPStatus = require('http-status-codes')
const FormData = require('form-data')
const { models } = require('../../models')
const log = require('../../util/logger')

const upload = async (filepath) => {
  try {
    const func = await models.Functions.findOne({
      where: {
        ms_service_name: 'apisuite-sandbox',
      },
    })

    if (!func || !func.microservice_url || !func.microservice_url.length) {
      log.error('[SANDBOX SERVICE - UPLOAD]: ms function not found or missing URL')
      return true
    }

    const msURL = func.microservice_url.slice(-1) === '/' ? func.microservice_url : `${func.microservice_url}/`
    const funcURL = new url.URL('upload', msURL)
    const formData = new FormData()
    formData.append('file', fs.createReadStream(filepath))

    const r = await fetch(funcURL.toString(), {
      method: 'POST',
      body: formData,
    })

    if (r.status !== HTTPStatus.OK) {
      log.error(await r.json(), '[CONTRACT SANDBOX UPLOAD]')
    }
  } catch (error) {
    log.error(error, '[SANDBOX SERVICE - UPLOAD]')
    return false
  }
}

module.exports = upload
