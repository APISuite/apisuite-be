const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router({ mergeParams: true }))
const controllers = require('../controllers')
const { validatePublicAppsListQuery } = require('./validation_schemas/app.schema')

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
router.getAsync('/',
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
router.getAsync('/labels',
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
router.getAsync('/:id',
  validatePublicAppsListQuery,
  controllers.app.publicAppDetails)

module.exports = router
