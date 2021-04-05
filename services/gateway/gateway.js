class Gateway {
  constructor (config) {
    this.config = config
    if (new.target === Gateway) {
      throw new Error('Cannot construct Gateway instances directly.')
    }

    if (!this.getServicesData) {
      throw new Error(`Gateway[${new.target}]: missing getServicesData implementation`)
    }

    if (!this.setupApisFromServices) {
      throw new Error(`Gateway[${new.target}]: missing setupApisFromServices implementation`)
    }

    if (!this.configureGatewaySubscription) {
      throw new Error(`Gateway[${new.target}]: missing configureGatewaySubscription implementation`)
    }

    if (!this.subscribeAPIs) {
      throw new Error(`Gateway[${new.target}]: missing subscribeAPIs implementation`)
    }

    if (!this.subscribeAll) {
      throw new Error(`Gateway[${new.target}]: missing subscribeAll implementation`)
    }

    if (!this.unsubscribeAPIs) {
      throw new Error(`Gateway[${new.target}]: missing unsubscribeAPIs implementation`)
    }

    if (!this.removeApp) {
      throw new Error(`Gateway[${new.target}]: missing removeApp implementation`)
    }
  }

  get globalSubscriptionTag () {
    return 'global-subscription'
  }
}

module.exports = Gateway
