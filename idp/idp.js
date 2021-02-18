class IdP {
  constructor (config) {
    this.config = config
    if (new.target === IdP) {
      throw new Error('Cannot construct IdP instances directly')
    }

    if (this.createClient === IdP.prototype.createClient) {
      throw new Error(`IdP[${new.target}]: missing createClient implementation`)
    }
    if (this.deleteClient === IdP.prototype.deleteClient) {
      throw new Error(`IdP[${new.target}]: missing deleteClient implementation`)
    }
  }

  getProvider () {
    return this.config.provider.toLowerCase()
  }

  getAuthenticationEnabled () {
    const enabled = this.config.configuration.authenticationEnabled || false
    return enabled && this.config.configuration.discoveryURL
  }

  getConfig () {
    return this.config.configuration
  }

  /**
   * IdP client configuration.
   * @typedef {Object} IdPClientConfig
   * @property {string} clientName
   * @property {string[]} redirectURIs
   */

  /**
   * IdP client data.
   * @typedef {Object} IdPClientData
   * @property {string} clientId
   * @property {string[]} clientSecret
   * @property {object} extra - IdP specific client data
   */

  /**
   * @abstract
   * @param {IdPClientConfig} clientConfig
   * @returns {Promise<IdPClientData>} client
   * @throws will throw an error if client creation fails
   * */
  async createClient (clientConfig) {
    throw new Error('IdP.createClient should not be called directly')
  }

  /**
   * @abstract
   * @param {string} clientID
   * @param {object} clientData
   * @returns {Promise<void>}
   * @throws will throw an error if client deletion fails
   * */
  async deleteClient (clientID, clientData) {
    throw new Error('IdP.deleteClient should not be called directly')
  }
}

module.exports = IdP
