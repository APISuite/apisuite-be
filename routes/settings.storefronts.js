const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')

/**
 * @openapi
 * /settings/storefronts/:
 *   get:
 *     description: Get the name of the StoreFronts
 *     tags: [Settings]
 *     parameters:
 *       - name: include
 *         description: Settings components to include in the response
 *         in: query
 *         schema:
 *           type: string
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Object with all configured StoreFronts settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings/StoreFronts'
 */
router.getAsync('/:name',
  controllers.settingsStorefronts.get)

module.exports = router
