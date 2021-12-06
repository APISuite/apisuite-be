const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { setup } = require('../middleware')
const { validateSetupBody } = require('./validation_schemas/user.schema')

/**
 * @openapi
 * /owner:
 *   get:
 *     description: Account owner information
 *     tags: [Owner]
 *     responses:
 *       200:
 *         description: Account owner information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 */
router.getAsync('/',
  controllers.owner.get)

/**
 * @openapi
 * /owner/setup:
 *   post:
 *     summary: Initial configuration setup
 *     description: Creates an initial user, main organization and settings, triggering also an invite email to the new user.
 *     tags: [Owner]
 *     requestBody:
 *       description: Setup data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - organization
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               organization:
 *                  $ref: '#/components/schemas/OrganizationSetup'
 *               settings:
 *                  $ref: '#/components/schemas/SettingsSetup'
 *               portalSettings:
 *                  type: object
 *     security:
 *       - x_setup_token: []
 *     responses:
 *       200:
 *         description: Setup completed with success
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/setup',
  setup,
  validateSetupBody,
  controllers.owner.setup)

module.exports = router
