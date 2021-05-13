const nodemailer = require('nodemailer')
const config = require('../../config')
const log = require('../../util/logger')

const transporter = nodemailer.createTransport(config.get('mailer.smtpConfig'))

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
    await transporter.sendMail(message)
  } catch (err) {
    log.error(err, '[EMAIL SEND]')

    if (err.response) {
      log.error(err.response.body, '[EMAIL SEND body]')
    }
  }
}
