const swaggerJsdoc = require('swagger-jsdoc')
const packageJson = require('../package.json')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Suite API',
      version: packageJson.version,
      description: `The API Suite API is an HTTP API.
      <br>It is the API that the API Suite Portal uses to communicate and interact with it's datastore.
      <br>So everything done in the API Suite Portal can be achieved via this API.`,
      'x-logo': {
        url: 'https://cloudcdn.apisuite.io/apisuite_logo.svg',
        backgroundColor: 'rgb(250, 250, 250)',
        altText: 'API Suite logo',
      },
    },
  },
  basePath: '/',
  apis: ['./routes/*.js'],
}

const specs = swaggerJsdoc(options)

module.exports = {
  specs,
}
