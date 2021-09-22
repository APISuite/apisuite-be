const semver = require('semver')
const fetch = require('node-fetch')
const { createAPIHandler } = require('../../controllers/api-helper')
const Gateway = require('./gateway')
const log = require('../../util/logger')
const { apiTypes, subscriptionModels } = require('../../util/enums')

// version of kong that has changes in plugin payload
const KONG_VERSION = '1.5.0'

class Kong extends Gateway {
  /**
   * Filter the service by tags with public value.
   * @param {Object} service Kong service list.
   * @returns {Array<Object>} The filtered list of public APIs.
   */
  _filterPublicAPIs (service) {
    if (service.data && service.data.length) {
      return service.data.filter((s) => s.tags && s.tags.indexOf('public') > -1)
    }
    return []
  }

  /**
   * Recursive function to handle service list pagination and filter them.
   * @param {String} next URL to fetch the next services list.
   * @param {String} apiKey API key to authorize the request.
   * @param {Array<Object>} services Array with the current list of services.
   * @returns {Promise<Array<Object>>} The list of services filtered.
   */
  async _handleServicesNext (next, apiKey, services) {
    const response = await fetch(next, {
      method: 'GET',
      headers: {
        apiKey,
      },
    })
    const srvs = await response.json()
    if (!srvs.next) {
      return [...services, ...this._filterPublicAPIs(srvs)]
    }
    return this._handleServicesNext(srvs.next, apiKey, [...services, ...this._filterPublicAPIs(srvs)])
  }

  /**
   * Get the list of Kong services.
   * @returns {Promise<Object>} Object containing the request status code and the filtered services.
   */
  async getServicesData () {
    const settings = this.config
    let filtered = []
    try {
      const response = await fetch(`${settings.url}/services`, {
        method: 'GET',
        headers: {
          apiKey: settings.apiKey,
        },
      })
      const serv = await response.json()
      filtered = this._filterPublicAPIs(serv)
      if (serv.next) {
        filtered = await this._handleServicesNext(serv.next, settings.apiKey, filtered)
      }
      return {
        statusCode: response.status,
        services: filtered,
      }
    } catch (error) {
      log.error(error, '[getServicesData]')
      return {
        statusCode: 500,
        services: filtered,
      }
    }
  }

  /**
   * Takes a list of Kong services, creates the respective APISuite core APIs and
   * configures the services in the gateway for subscription support.
   * @param {Object[]} services List of public apis in the gateway.
   * @returns {Promise<String>} Result message.
   */
  async setupApisFromServices (services) {
    const apis = []
    for (const s of services) {
      const r = createAPIHandler({
        name: s.name,
        baseUri: `${s.protocol}://${s.host}`,
        type: apiTypes.LOCAL,
      })
      apis.push(r)
    }
    const createdAPIs = await Promise.allSettled(apis)
    const finished = createdAPIs.filter((p) => p.status === 'fulfilled' && p.value.status < 400)

    for (const api of createdAPIs) {
      if (api.status !== 'fulfilled') continue

      try {
        await this.configureGatewaySubscription(api.value.api.name, api.value.api.id)
      } catch (error) {
        log.error('[setupApisFromServices] => configureGatewaySubscription', error)
      }
    }

    const msg = `Created ${finished.length} APIs of ${createdAPIs.length}.`
    log.info(msg, '[setupApisFromServices]')
    return msg
  }

  /**
   * Configures a Kong service to support subscription in the form of ACL with api key.
   * @param {String} service The remote service name or id.
   * @param {Promise<String|Number>} subscription The subscription name tag that the app will subscribe to. If number, it will be converted to string.
   */
  async configureGatewaySubscription (service, subscription) {
    subscription = subscription.toString()
    const settings = this.config

    let info = await fetch(`${settings.url}`, {
      method: 'GET',
    })
    info = await info.json()
    const version = info.version

    const pluginsURL = `${settings.url}/services/${service}/plugins`
    const auth = await fetch(pluginsURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: settings.apiKey,
      },
      body: JSON.stringify({
        name: 'key-auth',
        config: {
          key_names: ['apiKey', 'x-client-id'],
        },
      }),
    })

    if (!auth.ok && auth.status !== 409) {
      const err = await auth.text()
      log.error(`[configureGatewaySubscription] failed to set 'key-auth' plugin ${err}`)
      return false
    }

    const allowList = [subscription, this.globalSubscriptionTag]
    const config = {
      whitelist: allowList,
      hide_groups_header: true,
    }

    if (semver.gte(version, KONG_VERSION)) {
      config.allow = allowList
      delete config.whitelist
    }

    const acl = await fetch(pluginsURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: settings.apiKey,
      },
      body: JSON.stringify({
        name: 'acl',
        config,
      }),
    })

    if (!acl.ok && acl.status !== 409) {
      const err = await acl.text()
      log.error(`[configureGatewaySubscription] failed to set 'acl' plugin ${err}`)
      return false
    }

    return true
  }

  /**
   * Check if the consumer exists and has the authentication setup in the gateway.
   * @param {String} consumerName The consumer name.
   * @param {String} clientId The app client id.
   * @returns {Promise<Boolean>} If the consumer exists and is configured properly.
   */
  async _consumerExists (consumerName, clientId) {
    const settings = this.config
    try {
      // check if the consumer exists
      const consumer = await fetch(`${settings.url}/consumers/${consumerName}`, {
        method: 'GET',
        headers: {
          apiKey: settings.apiKey,
        },
      })

      if (!consumer.ok) return false

      // check if the consumer auth exists by searching for consumer by the key auth
      const auth = await fetch(`${settings.url}/key-auths/${clientId}/consumer`, {
        method: 'GET',
        headers: {
          apiKey: settings.apiKey,
        },
      })

      if (!auth.ok) return false

      const c = await consumer.json()
      const cAuth = await auth.json()

      if (c.username !== cAuth.username) return false

      return true
    } catch (error) {
      log.error(error, '_consumerExists')
      return false
    }
  }

  /**
   * Create a consumer in the gateway.
   * @param {String|Number} consumerName The consumer name. If number, it will be converted to string.
   * @throws {Error} If the request fails or the consumer is not properly created.
   */
  async _createConsumer (consumerName) {
    consumerName = consumerName.toString()
    const settings = this.config
    const response = await fetch(`${settings.url}/consumers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: settings.apiKey,
      },
      body: JSON.stringify({
        username: consumerName,
      }),
    })

    if (response.status === 409) return
    if (response.status !== 201) throw new Error('Consumer was not created properly.')

    const consumer = await response.json()

    // if the consumer was properly created it should return an object with the same username
    if (consumer.username !== consumerName) {
      throw new Error('Consumer was not created properly.')
    }
  }

  /**
   * Create a consumer authentication in the gateway.
   * @param {String} consumerName The consumer name.
   * @param {String} clientId The app client id.
   * @throws {Error} If the request fails or the consumer is not properly created.
   */
  async _createConsumerAuth (consumerName, clientId) {
    const settings = this.config
    const response = await fetch(`${settings.url}/consumers/${consumerName}/key-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: settings.apiKey,
      },
      body: JSON.stringify({
        key: clientId,
      }),
    })

    if (!response.ok) {
      throw new Error('Consumer auth was not created properly.')
    }

    const auth = await response.json()

    // if the consumer was properly created it should return an object with key === clientId
    if (auth.key !== clientId) {
      throw new Error('Consumer auth was not created properly.')
    }
  }

  /**
   * Create a consumer subscription in the gateway.
   * @param {String} consumerName The consumer name.
   * @param {String|Number} subscription The subscription name/tag that the app will be able to subscribe to. If number, it will be converted to string.
   * @returns {Promise<String>} The subscription name in the gateway.
   * @throws {Error} If the request fails or the consumer is not properly created.
   */
  async _createConsumerSubscription (consumerName, subscription) {
    subscription = subscription.toString()
    const settings = this.config
    const response = await fetch(`${settings.url}/consumers/${consumerName}/acls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: settings.apiKey,
      },
      body: JSON.stringify({
        group: subscription,
      }),
    })

    if (!response.ok) {
      throw new Error('Consumer subscription was not created properly.')
    }

    const acls = await response.json()

    // if the consumer was properly created it should return an object with group === subscription
    if (acls.group !== subscription) {
      throw new Error('Consumer subscription was not created properly.')
    }

    return acls.id
  }

  /**
   * Subscribe to an API in the gateway
   * @param {String} consumerName The consumer name, can be the app name.
   * @param {String} clientId The app client id.
   * @param {String[]} subscriptions The subscriptions name/tag that the app will subscribe to.
   * @throws {Error} If not all subscriptions are properly created
   */
  async subscribeAPIs (consumerName, clientId, subscriptions) {
    const exists = await this._consumerExists(consumerName, clientId)
    if (exists === false) {
      await this._createConsumer(consumerName)
      await this._createConsumerAuth(consumerName, clientId)
    }

    const promises = []
    for (const newSub of subscriptions) {
      promises.push(this._createConsumerSubscription(consumerName, newSub))
    }

    const results = await Promise.allSettled(promises)
    for (const res of results) {
      if (res.status === 'rejected') {
        log.error('[subscribeAPIs] => _createConsumerSubscription', res.reason)
      }
    }

    if (results.some((res) => res.status === 'rejected')) throw new Error('Could not configure all subscriptions')
  }

  /**
   * Subscribes to all APIs by subscribing to the global subscription tag.
   * @param {String} consumerName The consumer name, can be the app name.
   * @param {Promise<String>} clientId The app client id.
   */
  async subscribeAll (consumerName, clientId) {
    return this.subscribeAPIs(consumerName, clientId, [this.globalSubscriptionTag])
  }

  /**
   * Get the subscription id in the gateway.
   * @param {String} consumerName The consumer name.
   * @param {String} subscriptionName The subscription/api name.
   * @returns {Promise<String>} The subscription id.
   */
  async _getConsumerSubscriptionId (consumerName, subscriptionName) {
    const settings = this.config
    const response = await fetch(`${settings.url}/consumers/${consumerName}/acls/${subscriptionName}`, {
      method: 'GET',
      headers: {
        apiKey: settings.apiKey,
      },
    })

    const subs = await response.json()
    return subs.id
  }

  /**
   * Remove a consumer subscription in the gateway.
   * @param {String} consumerName The consumer name.
   * @param {String} subscriptionId The subcription id in the gateway.
   * @throws {Error} If the request fails or the consumer is not properly created.
   */
  async _removeConsumerSubscription (consumerName, subscriptionId) {
    const settings = this.config
    const response = await fetch(`${settings.url}/consumers/${consumerName}/acls/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        apiKey: settings.apiKey,
      },
    })

    if (response.status !== 204) {
      const err = await response.text()
      throw new Error(`Consumer subscription was not removed properly. ${err}`)
    }
  }

  /**
   * Remove subscription to an API in the gateway
   * @param {String} consumerName The consumer name.
   * @param {String} subscriptionName The subscription/api name.
   */
  async _unsubscribeAPI (consumerName, subscriptionName) {
    const subscriptionId = await this._getConsumerSubscriptionId(consumerName, subscriptionName)
    await this._removeConsumerSubscription(consumerName, subscriptionId)
  }

  /**
   * Remove subscription to a set of APIs in the gateway
   * @param {String} consumerName The consumer name.
   * @param {String[]} subscriptions The subscription/api names.
   */
  async unsubscribeAPIs (consumerName, subscriptions) {
    if (this.config.subscriptionModel === subscriptionModels.SIMPLIFIED) {
      throw new Error('Current subscription model does not allow to manage subscriptions.')
    }

    for (const sub of subscriptions) {
      try {
        await this._unsubscribeAPI(consumerName, sub)
      } catch (error) {
        log.error('[unsubscribeFromAPIs] => unsubscribeFromAPI', error)
      }
    }
  }

  /**
   * Removes a consumer in the gateway.
   * @param {String} consumerName The consumer name.
   * @throws {Error} If the request fails or the consumer is not properly created.
   */
  async _removeConsumer (consumerName) {
    const settings = this.config
    const response = await fetch(`${settings.url}/consumers/${consumerName}`, {
      method: 'DELETE',
      headers: {
        apiKey: settings.apiKey,
      },
    })

    if (response.status !== 204) {
      const err = await response.text()
      throw new Error(`Consumer subscription was not removed properly. ${err}`)
    }
  }

  /**
   * Removes an app from the gateway
   * @param {String} consumerName The consumer name (app id).
   */
  async removeApp (consumerName) {
    return this._removeConsumer(consumerName)
  }
}

module.exports = Kong
