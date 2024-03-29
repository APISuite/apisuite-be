const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn } = require('../middleware')
const controllers = require('../controllers')
const {
  validateSettingsBody,
  validateGatewaySettingsBody,
  validateIdPSettingsBody,
  validatePortalSettingsBody,
} = require('./validation_schemas/settings.schema')

const settingsStorefronts = require('./settings.storefronts')

router.use('/storefronts', settingsStorefronts)
/**
 * @openapi
 * /settings:
 *   get:
 *     description: Get list of account settings
 *     tags: [Settings]
 *     parameters:
 *       - name: include
 *         description: Settings components to include in the response
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [theme,navigation]
 *     responses:
 *       200:
 *         description: Object with all configured account settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.getAsync('/',
  controllers.settings.get)

/**
 * @openapi
 * /settings:
 *   put:
 *     description: Upsert (fully or partially) the list of account settings
 *     tags: [Settings]
 *     requestBody:
 *       description: Settings to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Object with all configured account settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.putAsync('/',
  loggedIn,
  validateSettingsBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settings.upsert)

/**
 * @openapi
 * /settings/portal:
 *   get:
 *     description: Get portal settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Portal settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.getAsync('/portal',
  controllers.settings.getPortalSettings)

/**
 * @openapi
 * /settings/portal:
 *   put:
 *     description: Upsert (fully or partially) the list of portal settings
 *     tags: [Settings]
 *     requestBody:
 *       description: Portal settings to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Portal settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.putAsync('/portal',
  loggedIn,
  validatePortalSettingsBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settings.updatePortalSettings)

/**
 * @openapi
 * /settings/idp:
 *   get:
 *     description: Get list of IdP settings
 *     tags: [Settings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Object with IdP configuration settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdPSettings'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/idp',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.SETTINGS),
  controllers.settings.getIdp)

/**
 * @openapi
 * /settings/idp:
 *   put:
 *     description: Update (fully or partially) the IdP configuration
 *     tags: [Settings]
 *     requestBody:
 *       description: IdP settings to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IdPSettings'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Object with all IdP configuration settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdPSettings'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.putAsync('/idp',
  loggedIn,
  validateIdPSettingsBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settings.updateIdp)

/**
 * @openapi
 * /settings/gateway:
 *   get:
 *     summary: Get Gateway settings
 *     description: Get gateway configuration
 *     tags: [Settings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Object with the Gateway configuration settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GatewaySettings'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/gateway',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.SETTINGS),
  controllers.settings.getGateway)

/**
 * @openapi
 * /settings/gateway:
 *   post:
 *     summary: Set Gateway settings
 *     description: Create or update gateway configuration
 *     tags: [Settings]
 *     requestBody:
 *       description: Gateway settings
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GatewaySettings'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Object with the Gateway configuration settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GatewaySettings'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/gateway',
  loggedIn,
  validateGatewaySettingsBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settings.setGateway)

/**
 * @openapi
 * /settings/gateway/sync:
 *   post:
 *     summary: Sync gateway data with core
 *     description: Sync the subscriptions/apis from the gateway with core
 *     tags: [Settings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Object with the Gateway configuration settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GatewaySync'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/gateway/sync',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settings.syncGateway)

/**
 * @openapi
 * /settings/navigation:
 *   get:
 *     description: Get navigation settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Navigation settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.getAsync('/navigation',
  controllers.settings.getNavigation)

/**
 * @openapi
 * /settings/navigation:
 *   put:
 *     description: Upsert (fully or partially) the list of navigation settings
 *     tags: [Settings]
 *     requestBody:
 *       description: Navigation settings to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Navigation settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.putAsync('/navigation',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settings.updateNavigationSettings)

module.exports = router
