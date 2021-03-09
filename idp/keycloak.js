const HTTPStatus = require('http-status-codes')
const fetch = require('node-fetch')
const log = require('../util/logger')
const IdP = require('./idp')

class Keycloak extends IdP {
  async createClient (clientConfig) {
    const r = await fetch(this.config.configuration.clientRegistrationURL, {
      method: 'POST',
      body: JSON.stringify({
        client_name: clientConfig.clientName,
        redirect_uris: clientConfig.redirectURIs,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.config.configuration.initialAccessToken}`,
      },
    })

    const client = await r.json()

    if (r.status !== HTTPStatus.CREATED) {
      log.error(client, '[CREATE KEYCLOAK CLIENT] ', r.status)
      throw new Error('Failed to create Keycloak Client')
    }

    const res = {
      clientId: `_${client.client_id}`,
      clientSecret: client.client_secret,
    }

    delete client.client_id
    delete client.client_secret
    res.extra = client

    return res
  }

  async deleteClient (clientID, clientData) {
    if (!clientID) return

    const r = await fetch(clientData.registration_client_uri, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${clientData.registration_access_token}`,
      },
    })

    if (r.status !== HTTPStatus.NO_CONTENT) {
      const res = await r.json()
      log.error(res, '[DELETE KEYCLOAK CLIENT]')
      throw new Error('Failed to delete Keycloak Client')
    }
  }
}

module.exports = Keycloak
