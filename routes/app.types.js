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

/**
 * @openapi
 * /apps/types/:
 *   get:
 *     summary: Create an app type
 *     description: Create an app type
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: App Types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/types'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.appTypes.get)

/**
 * @openapi
 * /apps/types/:
 *   post:
 *     summary: Create an app type
 *     description: Create an app type
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: app type
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       201:
 *         description: No Content
 *         schema:
 *             type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.postAsync('/',
  loggedIn,
  validateAppTypeBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.appTypes.post)

module.exports = router
