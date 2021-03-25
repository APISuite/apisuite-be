const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const { actions, possessions, resources } = require('../access-control')
const { accessControl, loggedIn } = require('../middleware')
const controllers = require('../controllers')
const { validateSettingsBody, validateGatewaySettingsBody, validateIdPSettingsBody } = require('./validation_schemas/settings.schema')

/**
 * @openapi
 * /settings:
 *   get:
 *     description: Get list of account settings
 *     tags: [Settings]
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
 * /settings/theme:
 *   get:
 *     description: Get theme settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Theme settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.getAsync('/theme',
  controllers.settings.getTheme)

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

module.exports = router
