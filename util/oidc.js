const fetch = require('node-fetch')
const HTTPStatus = require('http-status-codes')

const oidcDiscovery = async (discoveryURL) => {
  const discovery = await fetch(discoveryURL)
  if (!discovery.ok || discovery.status !== HTTPStatus.OK) {
    throw new Error('could not get discovery')
  }

  return discovery.json()
}

module.exports = {
  oidcDiscovery,
}
