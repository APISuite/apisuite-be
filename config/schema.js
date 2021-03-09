const schema = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'Server listen port',
    format: Number,
    default: 6001,
    env: 'APISUITE_API_PORT',
  },
  appURL: {
    doc: 'APISuite app URL',
    format: String,
    default: 'http://localhost:3001',
    env: 'APISUITE_APP_URL',
  },
  cipherPassword: {
    doc: 'Cipher password',
    format: String,
    default: 'DO_NOT_USE_THIS_DEFAULT',
    env: 'APISUITE_CIPHER_PASSWORD',
  },
  auth: {
    tokenIssuer: {
      doc: 'Access Token Issuer Claim',
      format: String,
      default: 'api.develop.apisuite.io',
      env: 'APISUITE_TOKEN_ISSUER',
    },
    accessTokenTTL: {
      doc: 'Access Token TTL (seconds)',
      format: Number,
      default: 3600, // 1 hour
      env: 'APISUITE_ACCESS_TOKEN_TTL',
    },
    accessTokenSecret: {
      doc: 'Access token signing secret',
      format: String,
      default: 'zadrv_*Q_z@6BO|Igc/,ikX]O_7q`,Gjeye7rSE{XAUw>8{2~RO_fHZ7BVH{Q)}',
      env: 'APISUITE_ACCESS_TOKEN_SECRET',
    },
    refreshTokenTTL: {
      doc: 'Refresh Token TTL (seconds)',
      format: Number,
      default: 30 * 86400, // 30 days
      env: 'APISUITE_REFRESH_TOKEN_TTL',
    },
    refreshTokenBytes: {
      doc: 'Refresh Token byte length',
      format: Number,
      default: 256,
      env: 'APISUITE_REFRESH_TOKEN_BYTES',
    },
    cookieHttpOnly: {
      doc: 'Auth cookies httpOnly flag',
      format: Boolean,
      default: true,
      env: 'APISUITE_AUTH_COOKIE_HTTPONLY',
    },
    cookieDomain: {
      doc: 'Auth cookies domain config',
      format: String,
      default: 'localhost',
      env: 'APISUITE_AUTH_COOKIE_DOMAIN',
    },
    cookieSecure: {
      doc: 'Auth cookies secure config',
      format: Boolean,
      default: true,
      env: 'APISUITE_AUTH_COOKIE_SECURE',
    },
    cookieSameSite: {
      doc: 'Auth cookies sameSite config',
      format: String,
      default: 'strict',
      env: 'APISUITE_AUTH_COOKIE_SAME_SITE',
    },
  },
  db: {
    host: {
      doc: 'Database host address',
      format: String,
      default: '127.0.0.1',
      env: 'POSTGRES_ADDRESS',
    },
    port: {
      doc: 'Database host port',
      format: String,
      default: '5432',
      env: 'POSTGRES_PORT_INTERNAL',
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'apisuite',
      env: 'POSTGRES_DB',
    },
    user: {
      doc: 'Database user',
      format: String,
      default: 'apisuite',
      env: 'POSTGRES_USERNAME',
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'dbpwd',
      env: 'POSTGRES_PASSWORD',
    },
  },
  mailer: {
    title: {
      doc: 'The email subject content title for the client',
      format: String,
      default: 'API Suite',
      env: 'APISUITE_API_MAILER_TITLE',
    },
    from: {
      doc: '"from" email address for outgoing emails',
      format: String,
      default: 'no-reply@apisuite.io',
      env: 'http://localhost:3001',
    },
    sendgridApiKey: {
      doc: 'Sendgrid API Key',
      format: String,
      default: 'secretapikey',
      env: 'SENDGRID_API_KEY',
    },
  },
  hydra: {
    clientsURL: {
      doc: 'Hydra clients endpoint',
      format: String,
      default: 'http://apisuite-hydra-server:4445/clients',
      env: 'HYDRA_SERVER_CLIENTS',
    },
  },
  msgBroker: {
    url: {
      doc: 'APISuite Message Broker URL',
      format: String,
      default: 'amqp://localhost:5672',
      env: 'APISUITE_MSG_BROKER_URL',
    },
    eventsExchange: {
      doc: 'APISuite Message Broker Events Exchange name',
      format: String,
      default: 'apisuite-events',
      env: 'APISUITE_RABBITMQ_EVENTS_EXCHANGE',
    },
  },
  setupToken: {
    doc: 'Single-use token for single-use on setup time',
    format: String,
    default: '',
    env: 'APISUITE_SETUP_TOKEN',
  },
}

module.exports = schema
