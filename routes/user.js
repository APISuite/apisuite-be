const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { accessControl, loggedIn, fileParser, recaptcha } = require('../middleware')
const { actions, possessions, resources } = require('../util/enums')
const { validateForgotPasswordBody, validateRecoverPasswordBody } = require('./validation_schemas/auth.schema')
const { validateInviteBody } = require('./validation_schemas/invite_organization.schema')
const apiTokensRouter = require('./user.api-tokens')
const {
  validateProfileUpdateBody,
  validateChangePasswordBody,
  validateNewSSOUserSchema,
} = require('./validation_schemas/user.schema')

router.use('/api-tokens', apiTokensRouter)

/**
 * @openapi
 * /users/password:
 *   put:
 *     description: Edit user password.
 *     tags: [User]
 *     requestBody:
 *       description: Password to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - new_password
 *             properties:
 *               old_password:
 *                 type: string
 *                 format: password
 *               new_password:
 *                 type: string
 *                 format: password
 *               recaptchaToken:
 *                  type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Password edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.putAsync('/password',
  loggedIn,
  validateChangePasswordBody,
  recaptcha,
  accessControl(actions.UPDATE, possessions.OWN, resources.PROFILE),
  controllers.user.changePassword)

/**
 * @openapi
 * /users/profile:
 *   get:
 *     description: Get user profile.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The user profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/profile',
  loggedIn,
  controllers.user.profile)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Retrieve user data
 *     description: Retrieve user data based on ID or OIDC ID (see 'oidc' query param).
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         description: The user id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: oidc
 *         description: Flag that enabled search by OIDC ID (admin only)
 *         in: query
 *         schema:
 *           type: boolean
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/:id',
  controllers.user.getById)

/**
 * @openapi
 * /users:
 *   delete:
 *     description: (self) Delete user.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.deleteAsync('/',
  loggedIn,
  controllers.user.deleteUser)

/**
 * @openapi
 * /users/forgot:
 *   post:
 *     description: Get recovery password email.
 *     tags: [User]
 *     requestBody:
 *       description: Recovery email.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               recaptchaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recovery email result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/forgot',
  validateForgotPasswordBody,
  recaptcha,
  controllers.auth.forgotPassword)

/**
 * @openapi
 * /users/recover:
 *   post:
 *     description: Recover the user password.
 *     tags: [User]
 *     requestBody:
 *       description: Recover password data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *              token:
 *                type: string
 *                format: uuid
 *              password:
 *                type: string
 *                format: password
 *     responses:
 *       200:
 *         description: Recovery result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/recover',
  validateRecoverPasswordBody,
  controllers.auth.recoverPassword)

/**
 * @openapi
 * /users/invite:
 *   post:
 *     deprecated: true
 *     description: Invite user.
 *     tags: [User]
 *     requestBody:
 *       description: Invitation data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role_id:
 *                 type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Invite.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invite'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/invite',
  loggedIn,
  validateInviteBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.ORGANIZATION),
  controllers.user.inviteUserToOrganization)

/**
 * @openapi
 * /users/invite/confirm:
 *   post:
 *     description: Confirm user invitation.
 *     tags: [User]
 *     requestBody:
 *       description: Invitation confirmation token.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Successfully joined.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/invite/confirm',
  controllers.user.confirmInvite)

/**
 * @openapi
 * /users/{id}/organizations/{orgId}:
 *   post:
 *     deprecated: true
 *     summary: Change user's active organization
 *     description: >
 *        Changes the user's active organization to {orgId},
 *        as long as {orgId} is an organization the user belongs to.
 *        This is deprecated and should be avoided at all costs. This piece of statefull data will
 *        soon be removed from the backend and API.
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         description: The user id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: orgId
 *         description: The organization id the user is switching to.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.postAsync('/:id/organizations/:orgId',
  loggedIn,
  controllers.user.setActiveOrganization)

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update user profile
 *     description: Update (own) user profile
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         required: true
 *         description: The user id.
 *         in: path
 *         schema:
 *           type: number
 *     requestBody:
 *       description: User profile details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.putAsync('/:id',
  loggedIn,
  validateProfileUpdateBody,
  controllers.user.updateUserProfile)

/**
 * @openapi
 * /users/{id}/avatar:
 *   post:
 *     description: Avatar picture upload
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         required: true
 *         description: The user id.
 *         in: path
 *         schema:
 *           type: number
 *     requestBody:
 *       description: Data form
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mediaFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar image URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: string
 *                   format: url
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/:id/avatar',
  loggedIn,
  fileParser,
  controllers.user.updateAvatar)

/**
 * @openapi
 * /users/{id}/avatar:
 *   delete:
 *     description: Removes user avatar
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         required: true
 *         description: The user id.
 *         in: path
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: No Content
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.deleteAsync('/:id/avatar',
  loggedIn,
  controllers.user.deleteAvatar)

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create SSO user
 *     description: Usable by admins only. Used to directly create an OIDC user without interaction form this user.
 *     tags: [User]
 *     requestBody:
 *       description: New SSO user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - oidcId
 *               - oidcProvider
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               oidcId:
 *                 type: string
 *               oidcProvider:
 *                 type: string
 *                 enum:
 *                   - keycloak
 *     responses:
 *       201:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/',
  validateNewSSOUserSchema,
  controllers.user.createSSOUser)

module.exports = router
