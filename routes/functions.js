const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { isInternalRequest } = require('../util/internal-request')

/**
 * @openapi
 * /functions:
 *   get:
 *     description: Get list of functions
 *     tags: [Function]
 *     security:
 *       - x_internal_token: []
 *     responses:
 *       200:
 *         description: List of functions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Function'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/',
  isInternalRequest,
  controllers.functions.getFunctions)

module.exports = router
