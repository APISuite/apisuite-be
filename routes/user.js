const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { accessControl, loggedIn, setup, fileParser } = require('../middleware')
const { actions, possessions, resources } = require('../access-control')
const { validateForgotPasswordBody, validateRecoverPasswordBody } = require('./validation_schemas/auth.schema')
const { validateInviteBody } = require('./validation_schemas/invite_organization.schema')
const {
  deprecatedValidateProfileUpdateBody,
  validateProfileUpdateBody,
  validateChangePasswordBody,
  validateSetupBody,
  validateNewAPITokenBody,
} = require('./validation_schemas/user.schema')

/**
 * @openapi
 * /users/api-tokens:
 *   get:
 *     description: Generates a new API token for the user.
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
router.getAsync('/api-tokens',
  loggedIn,
  controllers.user.listAPITokens)

/**
 * @openapi
 * /users/api-tokens:
 *   post:
 *     description: Generates a new API token for the user.
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
router.postAsync('/api-tokens',
  loggedIn,
  validateNewAPITokenBody,
  controllers.user.createAPIToken)

/**
 * @openapi
 * /users/api-tokens:id:
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
router.deleteAsync('/api-tokens/:id',
  loggedIn,
  controllers.user.revokeAPIToken)

/**
 * @openapi
 * /users/profile/update:
 *   put:
 *     deprecated: true
 *     description: Edit user profile.
 *     tags: [User]
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
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.putAsync('/profile/update',
  loggedIn,
  deprecatedValidateProfileUpdateBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.PROFILE),
  controllers.user.profileUpdate)

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
 * /users:
 *   get:
 *     description: Get list of user.
 *     tags: [User]
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
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.PROFILE),
  controllers.user.getAll)

/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     description: Get inputed user data.
 *     tags: [User]
 *     parameters:
 *       - name: userId
 *         description: The user id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/:userId',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.PROFILE),
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
 * /users/invitations/list:
 *   get:
 *     description: Get a list of invites.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of invitations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InviteCompact'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/invitations/list',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION),
  controllers.user.getListInvitations)

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
 * /users/setup:
 *   post:
 *     summary: Creates an initial user and main organization
 *     description: Creates an initial user and main organization, triggering also an invite email to the new user.
 *     tags: [User]
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
 *               organization_name:
 *                 type: string
 *               organization:
 *                  $ref: '#/components/schemas/OrganizationSetup'
 *               settings:
 *                  $ref: '#/components/schemas/SettingsSetup'
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
  controllers.user.setupMainAccount)

/**
 * @openapi
 * /users/{id}/organizations/{orgId}:
 *   post:
 *     summary: Change user's active organization
 *     description: >
 *        Changes the user's active organization to {orgId},
 *        as long as {orgId} is an organization the user belongs to.
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

module.exports = router
