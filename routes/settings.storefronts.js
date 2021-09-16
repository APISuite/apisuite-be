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

/**
* @openapi
* /settings/storefronts/:
*   put:
*     description: Insert or Update StoreFronts settings
*     tags: [Settings]
*     requestBody:
*       description: StoreFronts settings.
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*               payload:
*                  type: object
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
router.putAsync('/',
  controllers.settingsStorefronts.put)
module.exports = router
