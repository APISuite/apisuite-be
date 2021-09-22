const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const config = require('../../config')

/**
 * Generates a signed access token
 * @param {string|number} userID - User ID to use as token subject
 * @param {object} data - Extra claims to include in the token (defaults to empty object)
 * @returns {string} Signed JWT
 * */
const signAccessToken = (userID, data = {}) => {
  const jwtOptions = {
    expiresIn: config.get('auth.accessTokenTTL') + 's',
    issuer: config.get('auth.tokenIssuer'),
    subject: `${userID}`,
  }

  return jwt.sign(data, config.get('auth.accessTokenSecret'), jwtOptions)
}

/**
 * Refresh token
 * @typedef {Object} RefreshToken
 * @property {string} token - The token itself
 * @property {number} expiresAt - Expiration time in milliseconds
 */

/**
 * Generates a refresh token composed of a randomly generated string
 * @returns {RefreshToken}
 * */
const generateRefreshToken = async () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(config.get('auth.refreshTokenBytes'), (err, buf) => {
      if (err) reject(err)

      const refreshExpires = new Date(Date.now() + (config.get('auth.refreshTokenTTL') * 1000))

      resolve({
        token: buf.toString('hex'),
        expiresAt: refreshExpires.getTime(),
      })
    })
  })
}

/**
 * Access token validation result
 * @typedef {Object} VerifiedToken
 * @property {boolean} valid
 * @property {object} payload
 */

/**
 * Validates and decodes an access token
 * @param {string} token - Access token to verify
 * @returns {VerifiedToken}
 * */
const validateAccessToken = (token) => {
  const jwtOptions = {
    issuer: config.get('auth.tokenIssuer'),
  }
  try {
    const decoded = jwt.verify(token, config.get('auth.accessTokenSecret'), jwtOptions)
    return {
      valid: true,
      payload: decoded,
    }
  } catch (err) {
    return {
      valid: false,
      payload: {},
    }
  }
}

/**
 * Access/refresh token set
 * @typedef {Object} Tokens
 * @property {string} accessToken
 * @property {RefreshToken} refreshToken
 */

/**
 * Generates set of access/refresh tokens for a user.
 * @param {string|number} userID - User ID to use as token subject
 * @returns {Promise<Tokens>}
 * */
const generateTokenSet = async (userID) => {
  return {
    accessToken: signAccessToken(userID),
    refreshToken: await generateRefreshToken(),
  }
}

module.exports = {
  signAccessToken,
  generateRefreshToken,
  validateAccessToken,
  generateTokenSet,
}
