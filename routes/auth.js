const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const validations = require('./validation_schemas/auth.schema')
const { loggedIn, refreshToken, recaptcha } = require('../middleware')

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCredentials'
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/login',
  validations.validateLoginBody,
  recaptcha,
  controllers.auth.login)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *       - cookieRefreshAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/logout',
  refreshToken,
  loggedIn,
  controllers.auth.logout)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange refresh token for a new set of tokens
 *     tags: [Auth]
 *     security:
 *       - cookieRefreshAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/refresh',
  refreshToken,
  controllers.auth.refresh)

/**
 * @openapi
 * /auth/oidc/{provider}:
 *   get:
 *     summary: Triggers OIDC login flow for a provider
 *     tags: [Auth]
 *     parameters:
 *       - name: provider
 *         description: OIDC provider name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [keycloak]
 *       - name: state
 *         description: OAuth2 state parameter
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 10
 *           maxLength: 15
 *       - name: invite
 *         description: Flags invite sign in flow
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true]
 *     responses:
 *       302:
 *         description: OIDC provider login page redirect
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/oidc/:provider',
  validations.validateProvider,
  validations.validateState,
  validations.validateAuthFlags,
  controllers.auth.oidcAuth)

/**
 * @openapi
 * /auth/oidc/{provider}/token:
 *   post:
 *     summary: OIDC authorization code token exchange
 *     tags: [Auth]
 *     parameters:
 *       - name: provider
 *         description: OIDC provider name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [keycloak]
 *       - name: invite
 *         description: Flags invite sign in flow
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true]
 *     requestBody:
 *       description: Auth code
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.postAsync('/oidc/:provider/token',
  validations.validateCode,
  validations.validateAuthFlags,
  controllers.auth.oidcToken)

/**
 * @openapi
 * /auth/introspect:
 *   get:
 *     description: Introspect and validate auth cookie
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged in user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.getAsync('/introspect',
  loggedIn,
  controllers.auth.introspect)

module.exports = router
