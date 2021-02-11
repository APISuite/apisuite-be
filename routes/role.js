const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { loggedIn } = require('../middleware')

/**
 * @openapi
 * /roles:
 *   get:
 *     description: Get list of roles.
 *     tags: [Role]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.getAsync('/',
  loggedIn,
  controllers.role.list)

/**
 * @openapi
 * /roles:
 *   post:
 *     description: Create a custom role
 *     tags: [Role]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: New role data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/NewRole"
 *     responses:
 *       201:
 *         description: The list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.postAsync('/',
  loggedIn,
  controllers.role.create)

module.exports = router
