const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { loggedIn } = require('../middleware')
const { validatePagePayload } = require('./validation_schemas/page.schema')

/**
 * @openapi
 * /pages:
 *   get:
 *     description: Get list of custom pages.
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: The list of pages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SimplePage'
 */
router.getAsync('/',
  controllers.page.list)

/**
 * @openapi
 * /pages/{id}/{locale}:
 *   get:
 *     description: Get custom page.
 *     tags: [Pages]
 *     parameters:
 *       - name: id
 *         description: Page id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: locale
 *         description: i18n language code (en-US, pt-PT, etc)
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Page'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:id/:locale',
  controllers.page.get)

/**
 * @openapi
 * /pages:
 *   post:
 *     description: Create a custom page
 *     tags: [Pages]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: New page data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/NewPage"
 *     responses:
 *       201:
 *         description: Created page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Page'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.postAsync('/',
  loggedIn,
  validatePagePayload,
  controllers.page.create)

/**
 * @openapi
 * /pages/{id}:
 *   put:
 *     description: Update a custom page
 *     tags: [Pages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: Page id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     requestBody:
 *       description: New page data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/NewPage"
 *     responses:
 *       200:
 *         description: Updated page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Page'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.putAsync('/:id',
  loggedIn,
  validatePagePayload,
  controllers.page.update)

/**
 * @openapi
 * /pages/{id}:
 *   delete:
 *     description: Delete a custom page
 *     tags: [Pages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: Page id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.deleteAsync('/:id/:locale',
  loggedIn,
  controllers.page.deletePage)

module.exports = router
