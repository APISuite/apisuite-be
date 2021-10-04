const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router({ mergeParams: true }))
const controllers = require('../controllers')
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn, fileParser } = require('../middleware')

/**
 * @openapi
 * /media/{orgId}:
 *   post:
 *     summary: Upload images/media
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: orgId
 *         description: Org id
 *         required: true
 *         in: path
 *         schema:
 *           type: number
 *     requestBody:
 *       description: Media files to be uploaded
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
router.postAsync('/:orgId',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'orgId' }),
  fileParser,
  controllers.media.uploadMedia)

/**
 * @openapi
 * /media/{orgId}:
 *   delete:
 *     summary: Delete selected media objects
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: orgId
 *         description: Org id
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
router.deleteAsync('/:orgId',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'orgId' }),
  fileParser,
  controllers.media.deleteMedia)
module.exports = router
