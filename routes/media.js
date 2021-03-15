const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')
const { loggedIn } = require('../middleware')
const { fileParser } = require('../util/file-parser')

/**
 * @openapi
 * /media:
 *   post:
 *     description: Generic media file upload
 *     tags: [Media]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: Media file form
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media file object metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 objectURL:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/',
  loggedIn,
  fileParser,
  controllers.media.upload)

module.exports = router
