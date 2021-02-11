const config = require('../../config')
const sgMail = require('@sendgrid/mail')
const log = require('../../util/logger')

sgMail.setApiKey(config.get('mailer.sendgridApiKey'))

/**
 * Send the email
 *
 * @param {Object} message Object with the message options
 * @param {String} message.from The sender email address
 * @param {String} message.to The email of the receiver
 * @param {String} message.subject The subject line
 * @param {String} message.text The plain text email body
 * @param {String} message.html The html email body
 */
module.exports.send = async (message) => {
  try {
    await sgMail.send(message)
  } catch (err) {
    log.error(err, '[EMAIL SEND]')

    if (err.response) {
      log.error(err.response.body, '[EMAIL SEND body]')
    }
  }
}
