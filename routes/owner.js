const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')

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

module.exports = router
