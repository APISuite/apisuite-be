const SwaggerParser = require('@apidevtools/swagger-parser')
const converter = require('swagger2openapi')

/**
 * Check if the swagger object is a Open API 3.0 file
 * @param {Object} swagger - The swagger object
 * @returns {Boolean} - True if it is
 */
const checkIfOpenAPI = (swagger) => {
  if (typeof swagger !== 'object') throw Error(`[${typeof swagger}] is not of type object.`)
  return Object.prototype.hasOwnProperty.call(swagger, 'openapi')
}

/**
 * Validate the swagger object
 * @param {Object} swagger - The swagger object
 * @returns {Object} - The swagger with the errors found
 */
const validateSwagger = async (swagger) => {
  const validation = {
    api: null,
    errors: [],
  }

  try {
    validation.api = await SwaggerParser.parse(swagger)
  } catch (err) {
    validation.errors = [err.message]
  }

  const isOpenAPI = checkIfOpenAPI(validation.api)
  if (!isOpenAPI) {
    const converted = await converter.convertObj(validation.api, { verbose: true, lint: true })
    validation.api = converted.openapi
  }

  if (!validation.api.info.title.length) {
    validation.errors.push('invalid API title length')
  }
  if (!validation.api.info.version.length) {
    validation.errors.push('invalid API version length')
  }

  try {
    validation.api = await SwaggerParser.validate(validation.api)
  } catch (err) {
    validation.errors.push(err.message)
  }

  return validation
}

/**
 *
 * @param {Object} apiSpec - Parsed OpenAPI contract object
 * @returns {string[]} - array of API routes regex (['^/pets$', '^/pets/.*$'])
 */
const getRegexRoutes = (apiSpec) => {
  const parsedUrl = new URL(apiSpec.servers[0].url)
  const basePath = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname
  const pattern = /{.*}/gi
  return Object.keys(apiSpec.paths).map((route) => {
    const addSlash = route.indexOf('/') === 0 ? '' : '/'
    return `^${basePath}${addSlash}${route.replace(pattern, '.*')}$`
  })
}

module.exports = {
  validateSwagger,
  getRegexRoutes,
}
