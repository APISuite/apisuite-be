require('dotenv/config')
const config = require('./config')
;(() => {
  const secret = config.get('auth.accessTokenSecret')
  if (!secret) throw new Error('missing APISUITE_ACCESS_TOKEN_SECRET variable')

  if (Buffer.byteLength(secret, 'hex') < 32) throw new Error('APISUITE_ACCESS_TOKEN_SECRET key too short (min. 256 bits)')
})()

const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const basicAuth = require('express-basic-auth')
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
const promBundle = require('express-prom-bundle')

morgan.token('body', (req, res) => {
  const noLogRoutes = [
    '/auth/login',
    '/registration/security',
    '/users/password',
    '/users/recover',
  ]
  if (noLogRoutes.includes(req.originalUrl)) return
  if (req.originalUrl.split('/').pop() === 'signup') return
  return JSON.stringify(req.body)
})

const app = express()
app.disable('x-powered-by')

app.use(middleware.internalError)
app.use(cors(config.get('cors')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(':method :url :status - :body'))

app.use('/metrics', basicAuth({
  users: { [config.get('auth.metricsBasicAuthUser')]: config.get('auth.metricsBasicAuthPassword') },
  challenge: true,
}))
app.use(promBundle({ includeMethod: true }))

// Auth middleware
app.use(middleware.auth.cookieAuth)
app.use(middleware.auth.apiTokenAuth)

// Routes
app.use('/apis', routes.api)
app.use('/app', routes.app)
app.use('/apps', routes.app)
app.use('/auth', routes.auth)
app.use('/health', routes.health)
app.use('/invites', routes.invites)
app.use('/organizations', routes.organization)
app.use('/owner', routes.owner)
app.use('/registration', routes.registration)
app.use('/role', routes.role)
app.use('/roles', routes.role)
app.use('/settings', routes.settings)
app.use('/translations', routes.translations)
app.use('/users', routes.user)
app.use('/pages', routes.page)
app.use('/media', routes.media)
app.use('/resources', routes.resource)
app.use('/plan', routes.plan)
app.use(middleware.error)

// serve api documentation
app.use('/docs/spec.json', (req, res) => {
  res.status(HTTPStatus.OK).json(specs)
})

app.use('/api-docs', redoc({
  title: 'API Suite API Documentation',
  specUrl: '/docs/spec.json',
  favicon: 'https://cloudcdn.apisuite.io/favicon.ico',
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
    const [, rowsAffected] = await sequelize.query(`
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
