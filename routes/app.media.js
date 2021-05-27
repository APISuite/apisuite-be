const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router({ mergeParams: true }))
const controllers = require('../controllers')
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn, fileParser } = require('../middleware')
const { deleteMediaQuery } = require('./validation_schemas/app.schema')

/**
 * @openapi
 * /apps/{id}/media:
 *   put:
 *     summary: Upload app images/media
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: App id
 *         required: true
 *         in: path
 *         schema:
 *           type: number
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
router.putAsync('/',
  loggedIn,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'id' }),
  fileParser,
  controllers.app.uploadMedia)

/**
 * @openapi
 * /apps/{id}/media:
 *   delete:
 *     summary: Delete selected media objects
 *     tags: [App]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: App id
 *         required: true
 *         in: path
 *         schema:
 *           type: number
 *       - name: mediaURL
 *         description: URL of the media to delete
 *         required: true
 *         in: query
 *         schema:
 *           type: string
 *           format: uri
 *     responses:
 *       204:
 *         description: No content
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.deleteAsync('/',
  loggedIn,
  deleteMediaQuery,
  accessControl(actions.UPDATE, possessions.OWN, resources.APP, { idCarrier: 'params', idField: 'id' }),
  controllers.app.deleteMedia)

module.exports = router
