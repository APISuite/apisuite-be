const fetch = require('node-fetch')
const config = require('../../config')

const validateRecaptchaToken = async (token) => {
  const key = config.get('recaptcha.key')
  if (!key.length) return true

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${key}&response=${token}`
  const res = await fetch(url, { method: 'POST' })
  if (!res || res.status !== 200) return false

  const googleResp = await res.json()
  return googleResp.success && googleResp.score >= config.get('recaptcha.threshold')
}

module.exports = {
  validateRecaptchaToken,
}
