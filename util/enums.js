const settingTypes = {
  ACCOUNT: 'account',
  IDP: 'idp',
  GATEWAY: 'gateway',
  PLAN: 'plan',
  PORTAL: 'portal',
  NAVIGATION: 'navigation',
}

const idpProviders = {
  INTERNAL: 'internal',
  KEYCLOAK: 'keycloak',
}

const gatewayProviders = {
  KONG: 'kong',
}

const storageProviders = {
  LOCAL: 'local',
  S3: 's3',
}

const roles = {
  ADMIN: 'admin',
  ORGANIZATION_OWNER: 'organizationOwner',
  DEVELOPER: 'developer',
}

const apiTypes = {
  CLOUD: 'cloud',
  LOCAL: 'local',
}

const contentTargets = {
  PRODUCT_INTRO: 'product_intro',
  FEATURE: 'feature',
  USE_CASE: 'use_case',
  HIGHLIGHT: 'highlight',
}

const subscriptionModels = {
  SIMPLIFIED: 'simplified',
  DETAILED: 'detailed',
}

const appStates = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
}

const appVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

const resources = {
  API: 'api',
  APP: 'app',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  ORGANIZATION: 'organization',
}

const actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
}

const possessions = {
  ANY: 'any',
  OWN: 'own',
}

const regex = {
  SNAKE_CASE: /^[a-z](?:[a-z0-9]+_)*[a-z0-9]+$/,
}

module.exports = {
  apiTypes,
  appStates,
  appVisibility,
  contentTargets,
  idpProviders,
  gatewayProviders,
  roles,
  settingTypes,
  storageProviders,
  subscriptionModels,
  resources,
  actions,
  possessions,
  regex,
}
