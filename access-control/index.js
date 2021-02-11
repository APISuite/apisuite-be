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

module.exports = {
  resources,
  actions,
  possessions,
}
