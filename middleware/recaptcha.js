const HTTPStatus = require('http-status-codes')
const { validateRecaptchaToken } = require('../services/recaptcha')

module.exports = async (req, res, next) => {
  try {
    const valid = await validateRecaptchaToken(req.body.recaptchaToken)
    if (!valid) return res.status(HTTPStatus.BAD_REQUEST).json({ errors: ['invalid recaptcha'] })
    next()
  } catch (error) {
    next(error)
  }
}
