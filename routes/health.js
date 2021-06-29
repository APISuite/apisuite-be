const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: >
 *       Checks the general health status of the app server.
 *       Connectivity to a database is required and failure will result in a 500 response.
 *       Other non critical dependencies are tested and status info is passed in the response.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health check info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 time:
 *                   type: string
 *                 messageBroker:
 *                   type: string
 *                   enum: [ok,nok]
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/',
  controllers.health.healthCheck)

module.exports = router
