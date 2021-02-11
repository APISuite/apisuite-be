const settingTypes = {
  ACCOUNT: 'account',
  IDP: 'idp',
  GATEWAY: 'gateway',
  PLAN: 'plan',
}

const idpProviders = {
  INTERNAL: 'Internal',
  KEYCLOAK: 'Keycloak',
}

const gatewayProviders = {
  KONG: 'kong',
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
  subscriptionModels,
}
