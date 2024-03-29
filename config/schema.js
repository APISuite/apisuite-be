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
  recaptcha: {
    key: {
      doc: 'Google reCAPTCHA key (ignored if empty)',
      format: String,
      default: '',
      env: 'RECAPTCHA_KEY',
    },
    threshold: {
      doc: 'Google reCAPTCHA score threshold (inferior scores should be blocked)',
      format: Number,
      default: 0.5,
      env: 'RECAPTCHA_SCORE_THRESHOLD',
    },
  },
  passwordChangeInterval: {
    doc: 'Time between allowed password changes (hours)',
    format: Number,
    default: 24,
    env: 'ALLOWED_PASSWORD_CHANGES',
  },
  cors: {
    origin: {
      doc: 'Access-Control-Allow-Origin',
      format: Array,
      default: ['http://localhost:6001'],
      env: 'APISUITE_CORS_ALLOW_ORIGIN',
    },
    credentials: {
      doc: 'Access-Control-Allow-Credentials',
      format: Boolean,
      default: true,
      env: 'APISUITE_CORS_ALLOW_CREDENTIALS',
    },
    methods: {
      doc: 'Access-Control-Allow-Methods',
      format: String,
      default: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
      env: 'APISUITE_CORS_ALLOW_METHODS',
    },
  },
  apiURL: {
    doc: 'APISuite API URL',
    format: String,
    default: 'http://localhost:6001',
    env: 'APISUITE_API_URL',
  },
  cipherPassword: {
    doc: 'Cipher password',
    format: String,
    default: 'DO_NOT_USE_THIS_DEFAULT',
    env: 'APISUITE_CIPHER_PASSWORD',
  },
  registrationTTL: {
    doc: 'User registration record TTL (minutes)',
    format: Number,
    default: 30,
    env: 'APISUITE_REGISTRATION_TTL',
  },
  passwordRecoveryTTL: {
    doc: 'Password recovery token TTL (minutes)',
    format: Number,
    default: 120,
    env: 'APISUITE_RECOVERY_TTL',
  },
  passwordRecoveryInterval: {
    doc: 'Password recovery backoff interval (minutes)',
    format: Number,
    default: 5,
    env: 'APISUITE_RECOVERY_INTERVAL',
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
      doc: 'Access token signing secret. Minimum 256 bit hex string.',
      format: String,
      default: '',
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
    metricsBasicAuthUser: {
      doc: 'Prometheus metrics endpoint basic auth user',
      format: String,
      default: 'a',
      env: 'METRICS_AUTH_USER',
    },
    metricsBasicAuthPassword: {
      doc: 'Prometheus metrics endpoint basic auth password',
      format: String,
      default: 'b',
      env: 'METRICS_AUTH_PASSWORD',
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
      env: 'APISUITE_FROM_EMAIL',
    },
    smtpConfig: {
      pool: {
        doc: 'Use SMTP connection pool',
        format: Boolean,
        default: true,
        env: 'APISUITE_MAILER_SMTP_POOL',
      },
      host: {
        doc: 'SMTP host',
        format: String,
        default: 'API Suite',
        env: 'APISUITE_MAILER_SMTP_HOST',
      },
      port: {
        doc: 'SMTP port',
        format: Number,
        default: 25,
        env: 'APISUITE_MAILER_SMTP_PORT',
      },
      secure: {
        doc: 'Use SMTP over TLS',
        format: Boolean,
        default: true,
        env: 'APISUITE_MAILER_SMTP_SECURE',
      },
      auth: {
        type: {
          doc: 'SMTP authentication method',
          format: ['login', 'oauth2'],
          default: 'login',
          env: 'APISUITE_MAILER_SMTP_AUTH_TYPE',
        },
        user: {
          doc: 'SMTP username',
          format: String,
          default: 'myuser',
          env: 'APISUITE_MAILER_SMTP_USER',
        },
        pass: {
          doc: 'SMTP password',
          format: String,
          default: 'mypassword',
          env: 'APISUITE_MAILER_SMTP_PASSWORD',
        },
      },
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
  sso: {
    signInRedirectURL: {
      doc: 'Redirect URL for regular sign in flow',
      format: String,
      default: 'http://localhost:3001/sso/auth',
      env: 'APISUITE_SSO_SIGNIN_REDIRECT_URL',
    },
    inviteSignInRedirectURL: {
      doc: 'Redirect URL for invite page sign in flow',
      format: String,
      default: 'http://localhost:3001/auth/invitation',
      env: 'APISUITE_SSO_INVITE_REDIRECT_URL',
    },
  },
  storage: {
    provider: {
      doc: 'Cloud storage provider',
      format: ['local', 's3'],
      default: 'local',
      env: 'APISUITE_STORAGE_PROVIDER',
    },
    s3: {
      region: {
        doc: 'AWS S3 region',
        format: String,
        default: '',
        env: 'APISUITE_STORAGE_S3_REGION',
      },
      bucket: {
        doc: 'AWS S3 bucket to be used for media storage',
        format: String,
        default: '',
        env: 'APISUITE_STORAGE_S3_BUCKET',
      },
      credentials: {
        accessKeyId: {
          doc: 'AWS access key ID',
          format: String,
          default: '',
          env: 'APISUITE_STORAGE_S3_ACCESS_KEY_ID',
        },
        secretAccessKey: {
          doc: 'AWS secret access key',
          format: String,
          default: '',
          env: 'APISUITE_STORAGE_S3_SECRET_ACCESS_KEY',
        },
      },
    },
  },
  maxFileSizeUpload: {
    doc: 'Max file size upload (mb)',
    format: Number,
    default: 2 * 1024 * 1024, // 2mb
    env: 'APISUITE_MAX_FILE_SIZE_UPLOAD',
  },
  selfRegisterAppOauthClients: {
    doc: 'Enable/disable self registration of OAuth clients for approved applications',
    format: Boolean,
    default: true,
    env: 'APISUITE_APPS_CREATE_OAUTH_CLIENT',
  },
  appConnectorBackEnd: {
    doc: 'AppConnector URL backend',
    format: String,
    default: 'http://127.0.0.1:6008/',
    env: 'APISUITE_APPCONNECTOR_URL',
  },
  subscribedPlan: {
    doc: 'Subscription Plan',
    format: String,
    default: 'full',
    env: 'SUBSCRIPTION_PLAN',
  },
}

module.exports = schema
