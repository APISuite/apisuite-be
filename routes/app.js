const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { actions, possessions, resources } = require('../access-control')
const { accessControl, loggedIn } = require('../middleware')
const { validateAppBody, validateSubscriptionBody } = require('./validation_schemas/app.schema')

/**
 * @openapi
 * /apps:
 *   get:
 *     summary: Get list of apps
 *     description: Get list of apps in the context of the user's current organization
 *     tags: [App (v2)]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Simplified app list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppV2'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.APP),
  controllers.app.listApps)

/**
 * @openapi
 * /apps/:id:
 *   get:
 *     description: Get details of an application
 *     tags: [App (v2)]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: App details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppV2'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:id',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'id' }),
  controllers.app.getApp)

/**
 * @openapi
 * /apps:
 *   post:
 *     description: Create new draft app
 *     tags: [App (v2)]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App object that need to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/App"
 *     responses:
 *       201:
 *         description: The created App
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/App'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/',
  loggedIn,
  validateAppBody,
  accessControl(actions.CREATE, possessions.OWN, resources.APP),
  controllers.app.createDraftApp)

/**
 * @openapi
 * /apps/:id/request:
 *   post:
 *     description: Submit an access request for an application
 *     tags: [App (v2)]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.postAsync('/:id/request',
  loggedIn,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'id' }),
  controllers.app.requestAccess)

/**
 * @openapi
 * /app/list/:userId:
 *   get:
 *     description: Get list of user apps
 *     tags: [App]
 *     parameters:
 *       - name: userId
 *         required: true
 *         description: The user id.
 *         in: path
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user Apps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/App'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/list/:userId',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.APP),
  controllers.app.listApps)

/**
 * @openapi
 * /app/create:
 *   post:
 *     description: Create new app
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App object that need to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/App"
 *     responses:
 *       201:
 *         description: The created App
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/App'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/create',
  loggedIn,
  validateAppBody,
  accessControl(actions.CREATE, possessions.OWN, resources.APP),
  controllers.app.createApp)

/**
 * @openapi
 * /app/update/{id}:
 *   put:
 *     description: Update app
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The app id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       description: App object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/App"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The updated App
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/App'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.putAsync('/update/:id',
  loggedIn,
  validateAppBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP),
  controllers.app.updateApp)

/**
 * @openapi
 * /app/delete/{id}:
 *   delete:
 *     description: Delete app
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The app id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.deleteAsync('/delete/:id',
  loggedIn,
  accessControl(actions.DELETE, possessions.OWN, resources.APP),
  controllers.app.deleteApp)

/**
 * @openapi
 * /app/{id}/subscribe:
 *   put:
 *     description: Subscribe App to API
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The app id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       description: Subscribe to APIs
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptions
 *             properties:
 *               subscriptions:
 *                 type: array
 *                 items:
 *                   type: number
 *                   minimum: 0
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The updated app subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/App'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.putAsync('/:id/subscribe',
  loggedIn,
  validateSubscriptionBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP),
  controllers.app.subscribeToAPI)

/**
 * @openapi
 * /app/subscribed/{clientId}:
 *   post:
 *     description: Subscribe App to API
 *     tags: [App]
 *     parameters:
 *       - name: clientId
 *         description: The app client id.
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Is subscribed to API
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *     security:
 *       - x_app_token: []
 *     responses:
 *       200:
 *         description: The app subscription status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscribed'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/subscribed/:clientId',
  loggedIn,
  controllers.app.isSubscribedTo)

module.exports = router
