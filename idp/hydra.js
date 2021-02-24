const HTTPStatus = require('http-status-codes')
const { v4: uuidv4 } = require('uuid')
const fetch = require('node-fetch')
const log = require('../util/logger')
const IdP = require('./idp')

class Hydra extends IdP {
  async createClient (clientConfig) {
    const dataClient = Hydra.generateOAuth2Client(clientConfig)

    const r = await fetch(this.config.configuration.clientsURL, {
      method: 'POST',
      body: JSON.stringify({ data_client: dataClient }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    if (!r.ok || r.status !== HTTPStatus.CREATED) {
      log.error('[CREATE HYDRA CLIENT]')
      throw new Error('Failed to create Hydra Client')
    }

    const client = await r.json()

    const res = {
      clientId: `_${client.client_id}`,
      clientSecret: client.client_secret,
    }

    delete client.client_id
    delete client.client_secret
    res.extra = client

    return res
  }

  static generateOAuth2Client (clientConfig) {
    return {
      client_id: uuidv4(),
      client_secret: Hydra.generateClientSecret(120, '0123456789abcdefghijklmnopqrstuvxzABCDEFGHIJKLMNOPQRSTUVXZ'),
      client_name: clientConfig.clientName,
      redirect_uris: clientConfig.redirectURIs,
      grant_types: [
        'authorization_code',
        'client_credentials',
      ],
      response_types: [
        'code',
        'token',
      ],
      // "allowed_cors_origins": params.allowed_cors_origins || '*',
      scope: clientConfig.scope || 'sandbox openid offline offline_access profile',
      userinfo_signed_response_alg: 'none',
    }
  }

  static generateClientSecret (len, arr) {
    let ans = ''
    for (let i = len; i > 0; i--) {
      ans += arr[Math.floor(Math.random() * arr.length)]
    }
    return ans
  }

  async deleteClient (clientID, clientData) {
    if (!clientID) return

    const r = await fetch(`${this.config.configuration.clientsURL}/${clientID}`, {
      method: 'DELETE',
    })

    if (r.status !== HTTPStatus.NO_CONTENT) {
      const res = await r.json()
      log.error(res, '[DELETE HYDRA CLIENT]')
      throw new Error('Failed to delete Hydra Client')
    }
  }
}

module.exports = Hydra
