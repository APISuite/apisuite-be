const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router({ mergeParams: true }))
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn } = require('../middleware')
const controllers = require('../controllers')
const appMediaRoutes = require('./organization.app.media')
const {
  validateAppPatchBody,
  validateAppBody,
  validateSubscriptionBody,
} = require('./validation_schemas/app.schema')

router.use('/:appId/media', appMediaRoutes)

/**
 * @openapi
 * /organizations/{id}/apps:
 *   get:
 *     summary: Get organization apps
 *     description: Returns the list of all organization's apps.
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id', adminOverride: true }),
  controllers.app.listApps)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}:
 *   get:
 *     description: Get application
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
router.getAsync('/:appId',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id', adminOverride: true }),
  accessControl(actions.READ, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId', adminOverride: true }),
  controllers.app.getApp)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}:
 *   patch:
 *     description: Partial update app fields
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: App fields to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AppPatch"
 *     responses:
 *       200:
 *         description: App details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppV2'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/NotFound'
 */
router.patchAsync('/:appId',
  loggedIn,
  validateAppPatchBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id', adminOverride: true }),
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId', adminOverride: true }),
  controllers.app.patchApp)

/**
 * @openapi
 * /organizations/{id}/apps:
 *   post:
 *     description: Create new draft app
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
 */
router.postAsync('/',
  loggedIn,
  validateAppBody,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  accessControl(actions.CREATE, possessions.OWN, resources.APP),
  controllers.app.createDraftApp)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}:
 *   put:
 *     description: Update app
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
 */
router.putAsync('/:appId',
  loggedIn,
  validateAppBody,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId' }),
  controllers.app.updateApp)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}:
 *   delete:
 *     description: Delete app
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
router.deleteAsync('/:appId',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  accessControl(actions.DELETE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId' }),
  controllers.app.deleteApp)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}/request:
 *   post:
 *     summary: Access request
 *     description: Submits an access request for an application
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
router.postAsync('/:appId/request',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId' }),
  controllers.app.requestAccess)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}/revoke:
 *   post:
 *     summary: Revoke access request
 *     description: Submits an revoke access request for an application
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
router.postAsync('/:appId/revoke',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId' }),
  controllers.app.revokeAccess)

/**
 * @openapi
 * /organizations/{id}/apps/{appId}/subscribe:
 *   put:
 *     summary: Subscribe App to APIs
 *     description: Manage application subscriptions
 *     tags: [App]
 *     parameters:
 *       - name: id
 *         description: The organization id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: appId
 *         description: The application id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
 */
router.putAsync('/:appId/subscribe',
  loggedIn,
  validateSubscriptionBody,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'appId' }),
  controllers.app.subscribeToAPI)

module.exports = router
