const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')

/**
 * @openapi
 * /settings/storefronts/{name}:
 *   get:
 *     description: Get StoreFronts settings
 *     tags: [Settings]
 *     parameters:
 *       - name: name
 *         description: The StoreFronts name.
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: StoreFronts settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:name',
  controllers.settingsStorefronts.get)

module.exports = router
