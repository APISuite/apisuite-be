const config = require('../../config')
const fs = require('fs')
const path = require('path')
const url = require('url')
const handlebars = require('handlebars')
const moment = require('moment')
const { send } = require('./mailer')

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
 */
const sendRegisterConfirmation = async (message) => {
  const source = fs.readFileSync(path.join(__dirname, 'templates/confirm.hbs'))
  const template = handlebars.compile(source.toString())
  const confirmationLink = new url.URL(`/registration/confirm?token=${message.token}`, config.get('appURL'))

  const html = template({
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
 */
const sendRecoverPassword = async (message) => {
  const source = fs.readFileSync(path.join(__dirname, 'templates/recover.hbs'))
  const template = handlebars.compile(source.toString())
  const recoverLink = new url.URL(`/password/reset?token=${message.token}`, config.get('appURL'))

  const html = template({
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
 */
const sendInviteToOrg = async (message) => {
  const source = fs.readFileSync(path.join(__dirname, 'templates/confirm_invite.hbs'))
  const template = handlebars.compile(source.toString())
  const link = new url.URL(`/invite/confirm?token=${message.token}`, config.get('appURL'))

  const html = template({
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
 */
const sendInviteNewUserToOrg = async (message) => {
  const source = fs.readFileSync(path.join(__dirname, 'templates/confirm_invite.hbs'))
  const template = handlebars.compile(source.toString())
  // const link = new url.URL(`/auth/signup?token=${message.token}`, config.get('appURL'))
  const link = new url.URL(`/auth/invitation?token=${message.token}`, config.get('appURL'))

  const html = template({
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
