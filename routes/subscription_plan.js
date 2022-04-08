const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { newSubscriptionPlan } = require('./validation_schemas/subscription_plan')

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
router.postAsync('/',
  //newSubscriptionPlan,
  controllers.plan.insertPlan)

router.getAsync('',
  controllers.plan.getPlan)

module.exports = router
