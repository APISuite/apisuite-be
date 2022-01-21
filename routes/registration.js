const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { recaptcha } = require('../middleware')
const {
  validateUserDetailsBody,
  validateOrganizationDetailsBody,
  validateSecurityDetailsBody,
  validateUserConfirmBody,
  validateUserRegistrationInvitationBody,
  validateRegisterBody,
} = require('./validation_schemas/registration.schema')

/**
 * @openapi
 * /registration:
 *   post:
 *     description: Register as new user.
 *     tags: [Registration]
 *     requestBody:
 *       description: User registration
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - user
 *             type: object
 *             properties:
 *               recaptchaToken:
 *                 type: string
 *               user:
 *                  type: object
 *                  required:
 *                    - name
 *                    - email
 *                    - password
 *                  properties:
 *                    name:
 *                      type: string
 *                    email:
 *                      type: string
 *                      format: email
 *                    password:
 *                      type: string
 *               organization:
 *                   type: string
 *     responses:
 *       204:
 *         description: Successful registration
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.postAsync(
  '/',
  validateRegisterBody,
  recaptcha,
  controllers.registration.register,
)

/**
 * @openapi
 * /registration/confirm:
 *   post:
 *     description: Confirm registration.
 *     tags: [Registration]
 *     requestBody:
 *       description: Registration confirmation
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
 *         description: The confirmation
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
 *       404:
 *         description: Not Found
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync(
  '/confirm',
  validateUserConfirmBody,
  controllers.registration.confirmRegistration,
)

/**
 * @openapi
 * /registration/user:
 *   post:
 *     deprecated: true
 *     description: Register user details.
 *     tags: [Registration]
 *     requestBody:
 *       description: Registration user details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserDetails'
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: The registration token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   format: uuid
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync(
  '/user',
  validateUserDetailsBody,
  controllers.registration.setUserDetails,
)

/**
 * @openapi
 * /registration/organization:
 *   post:
 *     deprecated: true
 *     description: Register organization details.
 *     tags: [Registration]
 *     requestBody:
 *       description: Registration organization details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationDetails'
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successful registration
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync(
  '/organization',
  validateOrganizationDetailsBody,
  controllers.registration.setOrganizationDetails,
)

/**
 * @openapi
 * /registration/security:
 *   post:
 *     deprecated: true
 *     description: Register security details.
 *     tags: [Registration]
 *     requestBody:
 *       description: Registration security details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - password
 *               - registrationToken
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               registrationToken:
 *                 type: string
 *                 format: uuid
 *     security:
 *       - Bearer: []
 *     responses:
 *       201:
 *         description: Successful registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync(
  '/security',
  validateSecurityDetailsBody,
  controllers.registration.completeRegistration,
)

/**
 * @openapi
 * /registration/invitation:
 *   post:
 *     description: Validate invitation token and get user data.
 *     tags: [Registration]
 *     requestBody:
 *       description: Invitation token.
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
 *         description: The invited user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/invitation',
  validateUserRegistrationInvitationBody,
  controllers.registration.validateInvitation)

module.exports = router
