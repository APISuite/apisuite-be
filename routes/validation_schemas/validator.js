const HTTPStatus = require('http-status-codes')

/**
 * Returns a validator middleware for the provided schema.
 * @param {object} schema - Joi validation schema (or any object with a similar 'validate' function).
 * @param {string} payloadPath - Path to the payload to be validated, within Express's req object.
 *   Defaults to 'body'. Dot separated names are accepted.
 *   Accepts paths to nested properties, such as 'formdata.fields', which will trigger validation in 'req.formdata.fields'.
 *   If the req object does not contain the specified path, the request will be considered invalid and 400 will be sent.
 * @param {function} extraValidation - Additional validation to be executed after the basic schema validation.
 *   This function be passed the selected payload and should return an object containing an 'errors' property.
 * */
module.exports = (schema, payloadPath = 'body', extraValidation = null) => (req, res, next) => {
  if (!('validate' in schema)) return next()
  if (typeof schema.validate !== 'function') return next()

  if (!payloadPath) payloadPath = 'body'
  const pathParts = payloadPath.split('.')

  let payload = {}
  try {
    payload = pathParts.reduce((p, prop) => p[prop], req)
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ success: false, errors: ['Could not validate the request'] })
  }

  const result = schema.validate(payload, { presence: 'required' })
  if (result.error) {
    return res.status(HTTPStatus.BAD_REQUEST).send({ success: false, errors: result.error.details.map(d => d.message) })
  }

  if (extraValidation) {
    const extraResult = extraValidation(payload)
    if (extraResult.errors && extraResult.errors.length) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ success: false, errors: extraResult.errors })
    }
  }

  next()
}
