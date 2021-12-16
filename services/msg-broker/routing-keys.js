/**
 * These are the routing keys for the message broker.
 * As a rule, they must contain at least 3 parts: [component].[domain].[action]
 * In the context of this api:
 *  - the component part will almost always be 'api'
 *  - domain corresponds to a certain domain model or service in which some action took place
 *  - action is the actual event, such as 'created', 'deleted', and so on
 * */
const keys = {
  APP_CREATED: 'api.app.created',
  APP_UPDATED: 'api.app.updated',
  APP_DELETED: 'api.app.deleted',
  APP_REQUESTED: 'api.app.requested',
  ORG_CREATED: 'api.organization.created',
  ORG_UPDATED: 'api.organization.updated',
  ORG_DELETED: 'api.organization.deleted',
  ORG_USER_ROLE: 'api.organization.userRoleChanged',
  ORG_USER_INVITED: 'api.organization.userInvited',
  ORG_APPS_LISTED: 'api.organization.appsListed',
  ORG_APPS_READ: 'api.organization.appsRead',
  ORG_APPS_CREATED: 'api.organization.created',
  ORG_APPS_UPDATED: 'api.organization.updated',
  ORG_APPS_DELETED: 'api.organization.deleted',
  ORG_ACTIVITY: 'api.organization.activity',
  SETTINGS_UPDATED: 'account.settings.updated',
  USER_CREATED: 'api.user.created',
  USER_PASSWORD: 'api.user.password',
  USER_DELETED: 'api.user.deleted',
}

module.exports = keys
