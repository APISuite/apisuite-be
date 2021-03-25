const settingTypes = {
  ACCOUNT: 'account',
  IDP: 'idp',
  GATEWAY: 'gateway',
  PLAN: 'plan',
  THEME: 'theme',
}

const idpProviders = {
  INTERNAL: 'internal',
  KEYCLOAK: 'keycloak',
}

const gatewayProviders = {
  KONG: 'kong',
}

const storageProviders = {
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

module.exports = {
  apiTypes,
  appStates,
  contentTargets,
  idpProviders,
  gatewayProviders,
  roles,
  settingTypes,
  storageProviders,
  subscriptionModels,
}
