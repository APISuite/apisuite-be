const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const {
  loggedIn,
  accessControl,
} = require('../middleware')
const {
  actions,
  possessions,
  resources,
} = require('../util/enums')

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

/**
* @openapi
* /settings/storefronts/{name}:
*   put:
*     description: Insert or Update StoreFronts settings
*     tags: [Settings]
 *     parameters:
 *       - name: name
 *         description: The StoreFronts name.
 *         in: path
 *         required: true
 *         schema:
 *           type: string
*     requestBody:
*       description: StoreFronts settings.
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*     responses:
*       200:
*         description: StoreFronts settings
*         content:
*           application/json:
*             schema:
*               type: object
*       500:
*         $ref: '#/components/responses/Internal'
*/
router.putAsync('/:name',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.settingsStorefronts.put)
module.exports = router
