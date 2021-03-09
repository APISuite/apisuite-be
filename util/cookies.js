const config = require('../config')

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

module.exports = {
  getRevokedCookieConfig,
}
