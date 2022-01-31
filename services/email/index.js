const config = require('../../config')
const fs = require('fs')
const path = require('path')
const url = require('url')
const handlebars = require('handlebars')
const moment = require('moment')
const { send } = require('./mailer')

const DEFAULT_LOGO = 'https://cloudcdn.apisuite.io/apisuite_logo.png'

const getTemplateContent = (templateName) => {
  return fs.readFileSync(path.join(__dirname, `templates/${templateName}.hbs`))
}

/**
 * Module responsible for email dispatching.
 * @module services/email
 */

/**
 * Sends a registration confirmation email
 *
 * @param {Object} message Object with the message options
 * @param {String} message.email Destination email address
 * @param {String} message.token Registration token
 * @param {Object} options Options object
 * @param {String} options.logo Organization logo URL
 */
const sendRegisterConfirmation = async (message, options) => {
  const source = getTemplateContent('confirm')
  const template = handlebars.compile(source.toString())
  const confirmationLink = new url.URL(`/registration/confirm?token=${message.token}`, config.get('appURL'))

  const html = template({
    logo: options.logo || DEFAULT_LOGO,
    title: config.get('mailer.title'),
    date: moment().format('MMM Do, YYYY'),
    confirmationLink: confirmationLink.toString(),
  })

  const msg = {
    to: message.email,
    from: config.get('mailer.from'),
    subject: `${config.get('mailer.title')} account confirmation`,
    html,
  }

  await send(msg)
}

/**
 * Sends a password recovery email
 *
 * @param {Object} message Object with the message options
 * @param {String} message.email Destination email address
 * @param {String} message.token Password recovery token
 * @param {Object} options Options object
 * @param {String} options.logo Organization logo URL
 */
const sendRecoverPassword = async (message, options) => {
  const source = getTemplateContent('recover')
  const template = handlebars.compile(source.toString())
  const recoverLink = new url.URL(`/password/reset?token=${message.token}`, config.get('appURL'))

  const html = template({
    logo: options.logo || DEFAULT_LOGO,
    title: config.get('mailer.title'),
    date: moment().format('MMM Do, YYYY'),
    recoverLink: recoverLink.toString(),
  })

  const msg = {
    to: message.email,
    from: config.get('mailer.from'),
    subject: `${config.get('mailer.title')} password recovery`,
    html,
  }

  await send(msg)
}

/**
 * Send an invitation to add to the organization
 *
 * @param {Object} message Object with the message options
 * @param {String} message.email Destination email address
 * @param {String} message.token Invitation token
 * @param {Object} options Options object
 * @param {String} options.logo Organization logo URL
 */
const sendInviteToOrg = async (message, options) => {
  const source = getTemplateContent('confirm_invite')
  const template = handlebars.compile(source.toString())
  const link = new url.URL(`/auth/invitation?token=${message.token}`, config.get('appURL'))

  const html = template({
    logo: options.logo || DEFAULT_LOGO,
    org: message.org,
    title: config.get('mailer.title'),
    date: moment().format('MMM Do, YYYY'),
    link: link.toString(),
  })

  const msg = {
    to: message.email,
    from: config.get('mailer.from'),
    subject: `${config.get('mailer.title')} invitation to add to the organization`,
    html,
  }

  await send(msg)
}

/**
 * Send an invitation to add new user into the organization
 *
 * @param {Object} message Object with the message options
 * @param {String} message.email Destination email address
 * @param {String} message.token Invitation token
 * @param {Object} options Options object
 * @param {String} options.logo Organization logo URL
 * @param {Boolean} options.noReject Show/hide reject option on UI (default to false)
 */
const sendInviteNewUserToOrg = async (message, options) => {
  options.noReject = options.noReject || false
  const source = getTemplateContent('confirm_invite')
  const template = handlebars.compile(source.toString())
  const link = new url.URL(`/auth/invitation?token=${message.token}&noReject=${options.noReject}`, config.get('appURL'))

  const html = template({
    logo: options.logo || DEFAULT_LOGO,
    org: message.org,
    title: config.get('mailer.title'),
    date: moment().format('MMM Do, YYYY'),
    link: link.toString(),
  })

  const msg = {
    to: message.email,
    from: config.get('mailer.from'),
    subject: `${config.get('mailer.title')} invitation to join organization`,
    html,
  }

  await send(msg)
}

module.exports = {
  sendRegisterConfirmation,
  sendRecoverPassword,
  sendInviteToOrg,
  sendInviteNewUserToOrg,
}
