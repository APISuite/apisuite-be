const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const { loggedIn } = require('../middleware')
const controllers = require('../controllers')

/**
 * @openapi
 * /invites/{token}:
 *   get:
 *     summary: Get/validate token
 *     description: Gets (and implicitly validates) an invite token
 *     tags: [Invites]
 *     parameters:
 *       - name: token
 *         description: User invite token
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invite data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationInvite'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:token',
  controllers.invites.get)

/**
 * @openapi
 * /invites/{token}/accept:
 *   post:
 *     summary: Accept organization invite
 *     description: Accept invite to add user to organization
 *     tags: [Invites]
 *     parameters:
 *       - name: token
 *         description: User invite token
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.postAsync('/:token/accept',
  loggedIn,
  controllers.invites.accept)

/**
 * @openapi
 * /invites/{token}/reject:
 *   post:
 *     summary: Reject an organization invite
 *     description: Reject an invite to add user to organization
 *     tags: [Invites]
 *     parameters:
 *       - name: token
 *         description: User invite token
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.postAsync('/:token/reject',
  loggedIn,
  controllers.invites.reject)

module.exports = router
