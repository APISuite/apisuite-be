const { v4: uuidv4 } = require('uuid')
const fetch = require('node-fetch')
const jsonwebtoken = require('jsonwebtoken')
const jwksRSA = require('jwks-rsa')
const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const emailService = require('./email')
const { models, sequelize } = require('../models')
const jwt = require('../jwt')
const Idp = require('../idp')
const { settingTypes } = require('../util/enums')
const config = require('../config')
const { oidcDiscovery } = require('../util/oidc')

const isRecoveryValid = (createdAt) => {
  return new Date(createdAt.getTime() + config.get('passwordRecoveryTTL') * 60 * 1000) >= Date.now()
}

const isRecoveryRecent = (createdAt) => {
  return new Date(createdAt.getTime() + config.get('passwordRecoveryInterval') * 60 * 1000) >= Date.now()
}

const forgotPassword = async (req, res) => {
  const message = 'If an account is associated with this email, you will receive a message shortly.'

  const user = await models.User.findByLogin(req.body.email.toLowerCase())
  if (!user || (user && user.activationToken)) {
    // for security reasons we don't tell if the email exist or not
    return res.status(HTTPStatus.OK).send({ message })
  }

  const lastRecovery = await models.PasswordRecovery.findLatest(user.id)
  if (lastRecovery && isRecoveryRecent(lastRecovery.createdAt)) {
    return res.status(HTTPStatus.OK).send({ message })
  }

  const recoveryToken = uuidv4()
  try {
    await models.PasswordRecovery.create({
      user_id: user.id,
      token: recoveryToken,
    })
  } catch (error) {
    log.error(error, '[CREATE RECOVERY TOKEN]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to generate password recovery token.'] })
  }

  await emailService.sendRecoverPassword({
    email: user.email,
    token: recoveryToken,
  })

  return res.status(HTTPStatus.OK).send({ message })
}

const recoverPassword = async (req, res) => {
  const recovery = await models.PasswordRecovery.findOne({
    where: { token: req.body.token },
    include: [{
      model: models.User,
    }],
  })

  if (!recovery) {
    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Invalid token.'] })
  }
  if (!isRecoveryValid(recovery.createdAt)) {
    await recovery.destroy()

    return res.status(HTTPStatus.FORBIDDEN).send({ errors: ['Invalid token.'] })
  }

  let transaction
  try {
    transaction = await sequelize.transaction()

    recovery.user.password = req.body.password
    await recovery.user.save({ transaction })
    await recovery.destroy({ transaction })
    await models.RefreshToken.destroy({
      where: { userId: recovery.user.id },
      transaction,
    })

    await transaction.commit()

    return res.status(HTTPStatus.OK).send({ success: true, message: 'Password updated.' })
  } catch (error) {
    if (transaction) await transaction.rollback()

    log.error(error, '[RECOVER PASSWORD]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to update recover password.'] })
  }
}

const login = async (req, res) => {
  const errors = { errors: ['Invalid credentials'] }
  const user = await models.User.findByLogin(req.body.email.toLowerCase())
  if (!user || (user && user.activationToken)) {
    return res.status(HTTPStatus.UNAUTHORIZED).send(errors)
  }

  const passwordMatches = await user.checkPassword(req.body.password)
  if (!passwordMatches) {
    return res.status(HTTPStatus.UNAUTHORIZED).send(errors)
  }

  const transaction = await sequelize.transaction()
  try {
    const { accessToken, refreshToken } = await jwt.generateTokenSet(user.id)

    user.last_login = Date.now()
    await user.save({ transaction })

    await models.RefreshToken.create({
      token: refreshToken.token,
      userId: user.id,
      expiresAt: refreshToken.expiresAt,
    }, { transaction })

    await transaction.commit()

    const cookieConfigs = getCookieConfigs()

    return res
      .status(HTTPStatus.OK)
      .cookie('access_token', accessToken, cookieConfigs.accessToken)
      .cookie('refresh_token', refreshToken.token, cookieConfigs.refreshToken)
      .send()
  } catch (err) {
    await transaction.rollback()
    log.error(err, '[AUTH LOGIN]')
    return res.sendInternalError()
  }
}

const logout = async (req, res) => {
  await models.RefreshToken.destroy({
    where: {
      token: req.cookies.refresh_token,
      user_id: req.user.id,
    },
  })

  return res
    .cookie('access_token', '', getRevokedCookieConfig())
    .cookie('refresh_token', '', getRevokedCookieConfig())
    .sendStatus(HTTPStatus.NO_CONTENT)
}

const refresh = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const tokenEntity = await models.RefreshToken.findByPk(req.cookies.refresh_token, { transaction })
    if (!tokenEntity) {
      await transaction.rollback()
      return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['Invalid refresh token.'] })
    }

    const { accessToken, refreshToken } = await jwt.generateTokenSet(tokenEntity.userId)

    await models.RefreshToken.create({
      token: refreshToken.token,
      userId: tokenEntity.userId,
      expiresAt: refreshToken.expiresAt,
    }, { transaction })

    await tokenEntity.destroy({ transaction })
    await transaction.commit()

    const cookieConfigs = getCookieConfigs()

    return res
      .status(HTTPStatus.OK)
      .cookie('access_token', accessToken, cookieConfigs.accessToken)
      .cookie('refresh_token', refreshToken.token, cookieConfigs.refreshToken)
      .send()
  } catch (err) {
    await transaction.rollback()
    log.error(err, '[AUTH REFRESH]')
    return res.sendInternalError()
  }
}

const oidcAuth = async (req, res) => {
  const settings = await models.Setting.findOne({
    where: { type: settingTypes.IDP },
  })

  if (!settings) {
    log.error('OIDC Auth: missing SSO settings')
    return res.sendInternalError()
  }

  const idp = await Idp.getIdP()
  if (req.params.provider !== idp.getProvider()) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['SSO provider not configured'] })
  }
  const ssoClient = await models.SSOClient.findOne({
    where: { provider: idp.getProvider() },
  })
  if (!ssoClient) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['SSO provider not configured'] })
  }

  const discoveryData = await oidcDiscovery(settings.values.configuration.discoveryURL)

  const authURL = new URL(discoveryData.authorization_endpoint)
  authURL.searchParams.append('client_id', ssoClient.clientId)
  authURL.searchParams.append('scope', 'openid email')
  authURL.searchParams.append('state', req.query.state)
  authURL.searchParams.append('response_type', 'code')
  authURL.searchParams.append('redirect_uri', `${config.get('appURL')}/sso/auth`)

  res.redirect(authURL.toString())
}

const oidcToken = async (req, res) => {
  const settings = await models.Setting.findOne({
    where: { type: settingTypes.IDP },
  })

  if (!settings) {
    log.error('OIDC Auth: missing SSO settings')
    return res.sendInternalError()
  }

  const idp = await Idp.getIdP()
  const ssoClient = await models.SSOClient.findOne({
    where: { provider: idp.getProvider() },
  })
  if (!ssoClient) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ errors: ['SSO provider not configured'] })
  }

  const discoveryData = await oidcDiscovery(settings.values.configuration.discoveryURL)

  const tokens = await exchangeCode(req.body.code, ssoClient, discoveryData)
  if (!tokens) {
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['OIDC: could not authenticate'] })
  }

  const verified = await tokenVerifier(tokens.id_token, ssoClient.clientId, discoveryData)
  if (!verified) {
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['OIDC: invalid id token'] })
  }

  if (!verified.email) {
    return res.status(HTTPStatus.UNAUTHORIZED).send({ errors: ['OIDC: user email is required'] })
  }

  const transaction = await sequelize.transaction()
  try {
    let user = await models.User.findByOIDC(verified.sub, idp.getProvider(), transaction)
    if (!user) {
      user = await models.User.build({
        oidcProvider: idp.getProvider(),
        oidcId: verified.sub,
      })
    }

    user.name = verified.name || verified.email
    user.email = verified.email
    user.last_login = Date.now()
    await user.save({ transaction })

    const { accessToken, refreshToken } = await jwt.generateTokenSet(user.id)

    await models.RefreshToken.create({
      token: refreshToken.token,
      userId: user.id,
      expiresAt: refreshToken.expiresAt,
    }, { transaction })

    await transaction.commit()

    const cookieConfigs = getCookieConfigs()

    return res
      .status(HTTPStatus.OK)
      .cookie('access_token', accessToken, cookieConfigs.accessToken)
      .cookie('refresh_token', refreshToken.token, cookieConfigs.refreshToken)
      .send()
  } catch (err) {
    await transaction.rollback()
    log.error(err, '[AUTH LOGIN]')
    return res.sendInternalError()
  }
}

/**
 * Exchanges the authorization code for the access/ID tokens.
 * @param {string} code
 * @param {object} ssoClient
 * @param {object} discoveryData - Object with the data returned from OIDC discovery endpoint
 * @returns {Promise<null|object>} - Returns an object with the set of tokens obtained in code exchange
 * */
const exchangeCode = async (code, ssoClient, discoveryData) => {
  const params = new URLSearchParams()
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', `${config.get('appURL')}/sso/auth`)
  params.append('client_id', ssoClient.clientId)
  params.append('client_secret', ssoClient.clientSecret)

  const tokenRes = await fetch(discoveryData.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!tokenRes.ok || tokenRes.status !== HTTPStatus.OK) {
    return null
  }
  return tokenRes.json()
}

/**
 * Verifies the validity of an ID token.
 * @param {string} token - ID token
 * @param {string} clientID
 * @param {object} discoveryData - Object with the data returned from OIDC discovery endpoint
 * @returns {Promise<null|object>} - If valid, returns the token payload
 * */
const tokenVerifier = async (token, clientID, discoveryData) => {
  const decoded = jsonwebtoken.decode(token, { complete: true })

  // TODO implement key validation for non-RSA signed tokens
  const jwksClient = jwksRSA({
    strictSsl: true,
    jwksUri: discoveryData.jwks_uri,
  })

  const key = await jwksClient.getSigningKeyAsync(decoded.header.kid)
  const signingKey = key.getPublicKey()

  let verified
  try {
    verified = await jsonwebtoken.verify(token, signingKey, {
      issuer: discoveryData.issuer,
      audience: clientID,
    })
  } catch (err) {
    log.warn(err, 'tokenVerifier')
  }

  return verified
}

const getCookieConfigs = () => {
  const baseConfig = {
    httpOnly: config.get('auth.cookieHttpOnly'),
    secure: config.get('auth.cookieSecure'),
    sameSite: config.get('auth.cookieSameSite'),
    domain: config.get('auth.cookieDomain'),
  }

  return {
    accessToken: {
      ...baseConfig,
      expires: new Date(Date.now() + config.get('auth.accessTokenTTL') * 1000),
    },
    refreshToken: {
      ...baseConfig,
      expires: new Date(Date.now() + config.get('auth.refreshTokenTTL') * 1000),
      path: '/auth',
    },
  }
}

const getRevokedCookieConfig = () => {
  const baseConfig = {
    httpOnly: config.get('auth.cookieHttpOnly'),
    secure: config.get('auth.cookieSecure'),
    sameSite: config.get('auth.cookieSameSite'),
    domain: config.get('auth.cookieDomain'),
  }

  return {
    ...baseConfig,
    expires: new Date('1900-01-01'),
  }
}

const introspect = async (req, res) => {
  return res.status(HTTPStatus.OK).send({ id: req.user.id })
}

module.exports = {
  forgotPassword,
  recoverPassword,
  login,
  logout,
  refresh,
  oidcAuth,
  oidcToken,
  introspect,
}
