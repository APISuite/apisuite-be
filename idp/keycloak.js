const HTTPStatus = require('http-status-codes')
const fetch = require('node-fetch')
const { models } = require('../models')
const { idpProviders } = require('../util/enums')
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

  async deleteClient (clientID) {
    if (!clientID) return

    const app = await models.App.findByClientID(clientID)

    if (!app || app.idpProvider !== idpProviders.KEYCLOAK) {
      log.error(`[DELETE KEYCLOAK CLIENT] could not find app with clientID ${clientID}`)
      return
    }

    const r = await fetch(app.client_data.registration_client_uri, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${app.client_data.registration_access_token}`,
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
