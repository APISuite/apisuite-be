const amqp = require('amqp-connection-manager')
const routingKeys = require('./routing-keys')
const config = require('../../config')
const log = require('../../util/logger')

const connection = amqp.connect([config.get('msgBroker.url')])
connection.on('connect', () => log.info('Connected to Message Broker'))

const channelWrapper = connection.createChannel({
  json: true,
  setup: (channel) => channel.assertExchange(config.get('msgBroker.eventsExchange'), 'topic'),
})

/**
 * Asynchronously publishes an APISuite event in the Message Broker.
 * @param {String} routingKey
 * @param {object} event
 * */
const publishEvent = (routingKey, event) => {
  event.timestamp = new Date().toISOString()

  channelWrapper
    .publish(config.get('msgBroker.eventsExchange'), routingKey, event)
    .catch(err => log.error('Message Broker: message rejected:', err))
}

const checkConnection = () => {
  return connection.isConnected()
}

module.exports = {
  publishEvent,
  routingKeys,
  checkConnection,
}
