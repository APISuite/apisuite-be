const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const {
  loggedIn,
  accessControl,
} = require('../middleware')
const {
  actions,
  possessions,
  resources,
} = require('../util/enums')
const {
  validateAppTypeBody,
} = require('./validation_schemas/app.types')
const {
  validateAppTypeStatusBody,
} = require('./validation_schemas/app.types.status')
/**
 * @openapi
 * /apps/types/:
 *   get:
 *     summary: List app types
 *     tags: [App]
 *     responses:
 *       200:
 *         description: App Type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Type'
 */
router.getAsync('/',
  controllers.appTypes.get)

/**
 * @openapi
 * /apps/types/:
 *   post:
 *     summary: Create an app type
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: App Type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Type'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.postAsync('/',
  loggedIn,
  validateAppTypeBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.appTypes.post)

/**
 * @openapi
 * /apps/types/:
 *   post:
 *     summary: Delete an app type
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: App Type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Type'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

router.postAsync('/',
  loggedIn,
  validateAppTypeBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.appTypes.deleteType)

/**
 * @openapi
 * /apps/types/status/:
 *   post:
 *     summary: sets enabled status of an app type
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: App Type Status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeStatus'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

router.postAsync('/status/',
  loggedIn,
  validateAppTypeStatusBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.appTypes.postStatus)

module.exports = router
