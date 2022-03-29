const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router({ mergeParams: true }))
const controllers = require('../controllers')
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn, fileParser } = require('../middleware')
/**
 * @openapi
 * /resources/:
 *   post:
 *     summary: Upload images/resources
 *     tags: [Resources]
 *     security:
 *       - cookieAuth: []
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
 *               namespace:
 *                  type: string
 *                  required: true
 *               language:
 *                  type: string
 *     responses:
 *       200:
 *         description: Upload results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 savedObjects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       file:
 *                         type: file
 *                       url:
 *                         type: string
 *                       namespace:
 *                         type: string
 *                       language:
 *                          type: string
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
router.postAsync('/',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION),
  fileParser,
  controllers.resource.uploadResources)

/**
 * @openapi
 * /resources/{namespace}:
 *  get:
 *     description: Get Namespaced resource
 *     tags: [Resources]
 *     parameters:
 *       - name: namespace
 *         description: Namespace of the resource
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: language
 *         description: language of the resource
 *         required: false
 *         in: query
 *         schema:
 *           type: string
 *           format: uri
 *     responses:
 *       200:
 *         description: Resource Content
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *        $ref: '#/components/responses/Error'
 */

router.get('/:namespace', controllers.resource.getResources)

module.exports = router
