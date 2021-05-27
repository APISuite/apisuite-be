const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router({ mergeParams: true }))
const controllers = require('../controllers')
const { loggedIn } = require('../middleware')
const { validateNewAPITokenBody } = require('./validation_schemas/user.schema')

/**
 * @openapi
 * /users/api-tokens:
 *   get:
 *     summary: List user's API tokens
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Recovery email result.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/APIToken'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.getAsync('/',
  loggedIn,
  controllers.user.listAPITokens)

/**
 * @openapi
 * /users/api-tokens:
 *   post:
 *     summary: Generate an API token for the user
 *     tags: [User]
 *     requestBody:
 *       description: API Token payload.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: API Token data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APITokenFull'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.postAsync('/',
  loggedIn,
  validateNewAPITokenBody,
  controllers.user.createAPIToken)

/**
 * @openapi
 * /users/api-tokens/{id}:
 *   delete:
 *     description: Revoke API token.
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         description: API token id
 *         required: true
 *         in: path
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.deleteAsync('/:id',
  loggedIn,
  controllers.user.revokeAPIToken)

module.exports = router
