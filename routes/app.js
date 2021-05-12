const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { actions, possessions, resources } = require('../access-control')
const { accessControl, loggedIn, fileParser } = require('../middleware')
const {
  validateAppBody,
  validateSubscriptionBody,
  validatePublicAppsListQuery,
} = require('./validation_schemas/app.schema')

/**
 * @openapi
 * /apps:
 *   get:
 *     summary: Get list of apps
 *     description: Returns list of apps in the context of the user's current organization.
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Simplified app list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppList'
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
 * /apps/public:
 *   get:
 *     summary: Get list of public apps
 *     description: Returns a list of publicly accessible apps
 *     tags: [App]
 *     parameters:
 *       - name: search
 *         description: Search terms
 *         in: query
 *         schema:
 *           type: string
 *       - name: org_id
 *         description: Organization id(s) for filtering
 *         in: query
 *         schema:
 *           type: number
 *       - name: label
 *         description: App label(s) for filtering
 *         in: query
 *         schema:
 *           type: string
 *       - name: sort_by
 *         description: Sorting field
 *         in: query
 *         schema:
 *           type: string
 *           default: app
 *           enum:
 *             - app
 *             - org
 *             - updated
 *       - name: order
 *         description: Sorting order
 *         in: query
 *         schema:
 *           type: string
 *           default: asc
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: Public app list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicAppListPaginated'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.getAsync('/public',
  validatePublicAppsListQuery,
  controllers.app.listPublicApps)

/**
 * @openapi
 * /apps/public/labels:
 *   get:
 *     summary: Get the set public app labels
 *     tags: [App]
 *     responses:
 *       200:
 *         description: Labels list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.getAsync('/public/labels',
  controllers.app.listPublicLabels)

/**
 * @openapi
 * /apps/public/{id}:
 *   get:
 *     summary: Get details of public apps
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The app id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Public app
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicApp'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.getAsync('/public/:id',
  validatePublicAppsListQuery,
  controllers.app.publicAppDetails)

/**
 * @openapi
 * /apps/{id}:
 *   get:
 *     description: Get details of an application
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The app id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
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
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App object that need to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AppDraft"
 *     responses:
 *       201:
 *         description: The created App
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppV2'
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
 * /apps/{id}:
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
 *             $ref: "#/components/schemas/AppDraft"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The updated App
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppV2'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.putAsync('/:id',
  loggedIn,
  validateAppBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP),
  controllers.app.updateApp)

/**
 * @openapi
 * /apps/:id/media:
 *   put:
 *     summary: Upload app images/media
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App object that need to be created
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Upload results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 savedImages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       file:
 *                         type: string
 *                       url:
 *                         type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       file:
 *                         type: string
 *                       error:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.putAsync('/:id/media',
  loggedIn,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'id' }),
  fileParser,
  controllers.app.uploadMedia)

/**
 * @openapi
 * /apps/:id/request:
 *   post:
 *     summary: Access request
 *     description: Submits an access request for an application
 *     tags: [App]
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
 * /apps/{id}:
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.deleteAsync('/:id',
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
