// Documentation for apps endpoint models

/**
 * @openapi
 * components:
 *   schemas:
 *     AppV2:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         orgId:
 *           type: number
 *         name:
 *           type: string
 *         shortDescription:
 *           type: string
 *         description:
 *           type: string
 *         redirectUrl:
 *           type: string
 *           format: uri
 *         clientId:
 *           type: string
 *         clientSecret:
 *           type: string
 *         subscriptions:
 *           type: array
 *           items:
 *             type: number
 *             minimum: 0
 *         tosUrl:
 *           type: string
 *           format: uri
 *         privacyUrl:
 *           type: string
 *           format: uri
 *         youtubeUrl:
 *           type: string
 *           format: uri
 *         websiteUrl:
 *           type: string
 *           format: uri
 *         supportUrl:
 *           type: string
 *           format: uri
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     App:
 *       type: object
 *       required:
 *         - name
 *         - visibility
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         visibility:
 *           type: string
 *           description: App visibility
 *           enum:
 *             - public
 *             - private
 *         clientId:
 *           type: string
 *         clientSecret:
 *           type: string
 *         pub_urls:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - url
 *               - type
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               type:
 *                 type: string
 *                 enum:
 *                   - client
 *                   - tos
 *                   - policy
 *                   - support
 *                   - support_email
 *         subscriptions:
 *           type: array
 *           items:
 *             type: number
 *             minimum: 0
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Subscribed:
 *       type: object
 *       required:
 *         - success
 *         - org_code
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *         org_code:
 *           type: string
 *         message:
 *           type: string
*/
