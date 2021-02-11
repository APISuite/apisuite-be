require('dotenv/config')
const config = require('./config')
const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const routes = require('./routes')
const { models } = require('./models')
const log = require('./util/logger')
const middleware = require('./middleware')
const HTTPStatus = require('http-status-codes')
const { specs } = require('./util/swagger-docs')
const { redoc } = require('./util/redoc')
const { settingTypes, idpProviders } = require('./util/enums')
const { sequelize } = require('./models')

const app = express()

// Application-Level API
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status - :body'))

app.use(middleware.internalError)

// Auth middleware
app.use(middleware.auth)

// Routes
app.use('/apis', routes.api)
app.use('/app', routes.app)
app.use('/apps', routes.app)
app.use('/auth', routes.auth)
app.use('/functions', routes.functions)
app.use('/invites', routes.invites)
app.use('/organization', routes.organization)
app.use('/organizations', routes.organization)
app.use('/owner', routes.owner)
app.use('/registration', routes.registration)
app.use('/role', routes.role)
app.use('/roles', routes.role)
app.use('/settings', routes.settings)
app.use('/users', routes.user)

app.use(middleware.error)

// serve images for documentation
app.use('/assets/images/apisuite_logo.svg', (req, res) => {
  res.status(HTTPStatus.OK).sendFile('./util/assets/apisuite_logo.svg', { root: '.' })
})
app.use('/assets/images/favicon.ico', (req, res) => {
  res.status(HTTPStatus.OK).sendFile('./util/assets/favicon.ico', { root: '.' })
})
// serve api documentation
app.use('/docs/spec.json', (req, res) => {
  res.status(HTTPStatus.OK).json(specs)
})

app.use('/api-docs', redoc({
  title: 'API Suite API Documentation',
  specUrl: '/docs/spec.json',
  favicon: '/assets/images/favicon.ico',
}))

const bootstrapIdPSettings = async () => {
  const settings = await models.Setting.findOne({
    where: { type: settingTypes.IDP },
  })

  if (!settings) {
    return models.Setting.create({
      type: settingTypes.IDP,
      values: {
        provider: idpProviders.INTERNAL,
        configuration: {
          clientsURL: config.get('hydra.clientsURL'),
        },
      },
    })
  }
}

const bootstrapSetupToken = async () => {
  if (config.get('setupToken')) {
    // eslint-disable-next-line no-unused-vars
    const [_, rowsAffected] = await sequelize.query(`
      INSERT INTO setup_token (token)
      SELECT ?
      WHERE NOT EXISTS (SELECT * FROM setup_token);
    `, { replacements: [config.get('setupToken')] })

    if (rowsAffected) log.info('CREATED SETUP TOKEN')
  }
}

const start = async () => {
  await bootstrapSetupToken()
  await bootstrapIdPSettings()

  app.listen(config.get('port'), () =>
    log.info(`APISuite API listening on port ${config.get('port')}!`),
  )
}

start().catch((err) => {
  log.error(err, '[FAILED TO START]')
})

module.exports = app // for testing
