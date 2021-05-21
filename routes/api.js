const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn, fileParser } = require('../middleware')
const validations = require('./validation_schemas/api.schema')

/**
 * @openapi
 * /apis:
 *   get:
 *     description: Get list of available APIs, sorted by update time (desc).
 *     tags: [API]
 *     parameters:
 *       - name: page
 *         description: The page we are at.
 *         in: query
 *         schema:
 *           type: number
 *       - name: pageSize
 *         description: The number of documents per page.
 *         in: query
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: The list of APIs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIsPaginated'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.getAsync('/',
  controllers.api.getAll)

/**
 * @openapi
 * /apis/{id}:
 *   get:
 *     description: Get API details.
 *     tags: [API]
 *     parameters:
 *       - name: id
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: The API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/API'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/:id',
  controllers.api.getById)

/**
 * @openapi
 * /apis:
 *   post:
 *     description: Create a new API.
 *     tags: [API]
 *     requestBody:
 *       description: New API.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - baseUri
 *             properties:
 *               name:
 *                 type: string
 *               baseUri:
 *                 type: string
 *               baseUriSandbox:
 *                 type: string
 *               docs:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/APIdoc'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: The API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/API'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/',
  loggedIn,
  validations.validateAPIBody,
  accessControl(actions.CREATE, possessions.ANY, resources.API),
  controllers.api.createAPI)

/**
 * @openapi
 * /apis/{id}:
 *   patch:
 *     description: Updates an API.
 *     tags: [API]
 *     parameters:
 *       - name: id
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       description: New API data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               docs:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/APIdoc'
 *               versions:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/APIversionPatch'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.patchAsync('/:id',
  loggedIn,
  validations.validateAPIBody,
  accessControl(actions.UPDATE, possessions.ANY, resources.API),
  controllers.api.updateAPI)

/**
 * @openapi
 * /apis/{id}/publish:
 *   post:
 *     description: Publishes an API
 *     tags: [API]
 *     parameters:
 *       - name: id
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/:id/publish',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.API),
  controllers.api.setPublished(true))

/**
 * @openapi
 * /apis/{id}/unpublish:
 *   post:
 *     description: Unpublishes an API
 *     tags: [API]
 *     parameters:
 *       - name: id
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/:id/unpublish',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.API),
  controllers.api.setPublished(false))

/**
 * @openapi
 * /apis/{id}:
 *   delete:
 *     description: Deletes an API.
 *     tags: [API]
 *     parameters:
 *       - name: id
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: API deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.deleteAsync('/:id',
  loggedIn,
  accessControl(actions.DELETE, possessions.ANY, resources.API),
  controllers.api.deleteAPI)

/**
 * @openapi
 * /apis/{apiId}/versions:
 *   post:
 *     description: Create a new API version.
 *     tags: [API]
 *     parameters:
 *       - name: apiId
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       description: New API version.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               live:
 *                 type: boolean
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: The API version
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIversion'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/:apiId/versions',
  loggedIn,
  fileParser,
  validations.validateAPIversionBody,
  accessControl(actions.CREATE, possessions.ANY, resources.API),
  controllers.api.createAPIversion)

/**
 * @openapi
 * /apis/{apiId}/versions/{id}:
 *   get:
 *     description: Get API version details.
 *     tags: [API]
 *     parameters:
 *       - name: apiId
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *       - name: id
 *         description: The API version id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The API version
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIversion'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/:apiId/versions/:id',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.API),
  controllers.api.getVersionById)

/**
 * @openapi
 * /apis/{apiId}/versions/{id}:
 *   put:
 *     description: Update API version data.
 *     tags: [API]
 *     parameters:
 *       - name: apiId
 *         description: The API id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *       - name: id
 *         description: The API version id.
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       description: New API version data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               live:
 *                 type: boolean
 *               deprecated:
 *                 type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: API version updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIversion'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.patchAsync('/:apiId/versions/:id',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.API),
  controllers.api.updateAPIversion)

module.exports = router
