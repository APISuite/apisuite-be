// Documentation for apps endpoint models

/**
 * @openapi
 * components:
 *   schemas:
 *     AppList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/AppV2'
 *
 *     PublicAppListPaginated:
 *       type: object
 *       properties:
 *         rows:
 *           $ref: '#/components/schemas/PublicAppList'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *     PublicAppList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/PublicApp'
 *
 *     PublicApp:
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
 *         logo:
 *           type: string
 *           format: uri
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
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
 *         directUrl:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         organization:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             tosUrl:
 *               type: string
 *               format: uri
 *             privacyUrl:
 *               type: string
 *               format: uri
 *             supportUrl:
 *               type: string
 *               format: uri
 *          appType:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *              client:
 *                type: string
 *
 *
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
 *         logo:
 *           type: string
 *           format: uri
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
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
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
 *         directUrl:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         appType:
 *            $ref: '#/components/schemas/Type'
 *
 *     AppDraft:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 255
 *         shortDescription:
 *           type: string
 *           maxLength: 60
 *         description:
 *           type: string
 *         visibility:
 *           type: string
 *           description: App visibility
 *           enum:
 *             - public
 *             - private
 *         logo:
 *           type: string
 *           format: uri
 *         redirectUrl:
 *           type: string
 *           format: uri
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
 *         directUrl:
 *           type: string
 *           format: uri
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         metadata:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppMetadata'
 *         appTypeId:
 *           type: number
 *
 *     AppMetadata:
 *       type: object
 *       required:
 *         - key
 *         - value
 *         - title
 *       properties:
 *         key:
 *           type: string
 *         value:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *
 *     AppPatch:
 *       type: object
 *       properties:
 *         visibility:
 *           type: string
 *           description: App visibility
 *           enum:
 *             - public
 *             - private
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         metadata:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppMetadata'
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
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
*/

/**
 * @openapi
 * components:
 *   schemas:
 *     Type:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         type:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         enabled:
 *           type: boolean
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     TypeStatus:
 *       type: object
 *       properties:
 *         type:
 *           type: number
 *         enabled:
 *           type: boolean
 */
