const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const { actions, possessions, resources } = require('../util/enums')
const { accessControl, loggedIn } = require('../middleware')
const controllers = require('../controllers')

/**
 * @openapi
 * /translations/{locale}/{extension}:
 *   get:
 *     summary: Get translations object for a locale
 *     tags: [Translations]
 *     parameters:
 *       - name: locale
 *         description: i18n language code (en-US, pt-PT, etc)
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: extension
 *         description: extension of each language (core, etc)
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Translations data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:locale/',
  controllers.translations.get)

/**
 * @openapi
 * /translations/{locale}/{extension}:
 *   get:
 *     summary: Get translations object for a locale
 *     tags: [Translations]
 *     parameters:
 *       - name: locale
 *         description: i18n language code (en-US, pt-PT, etc)
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: extension
 *         description: extension of each language (en-US, pt-PT, etc)
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Translations data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:locale/:extension',
  controllers.translations.get)

/**
 * @openapi
 * /translations/{locale}:
 *   put:
 *     summary: Upsert translations for locale
 *     tags: [Translations]
 *     parameters:
 *       - name: locale
 *         description: i18n language code (en-US, pt-PT, etc)
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Full translations object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Translations data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.putAsync('/:locale/:extension',
  loggedIn,
  accessControl(actions.UPDATE, possessions.ANY, resources.SETTINGS),
  controllers.translations.upsert)

module.exports = router
