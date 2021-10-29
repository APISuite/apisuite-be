// Documentation for API endpoint models

/** @openapi
 * components:
 *   schemas:
 *     API:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         baseUri:
 *           type: string
 *         baseUriSandbox:
 *           type: string
 *         docs:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/APIdocLegacy'
 *         apiDocs:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/APIdoc'
 *         apiVersions:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/APIversion'
 *         type:
 *           type: string
 *           enum: [local, cloud]
 *         publishedAt:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     APIdoc:
 *       type: object
 *       required:
 *         - rows
 *         - pagination
 *       properties:
 *         features:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/ApiDocsItems'
 *         useCases:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/ApiDocsItems'
 *         highlights:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/ApiDocsItems'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     APIsPaginated:
 *       type: object
 *       required:
 *         - rows
 *         - pagination
 *       properties:
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/API'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 */

/** @openapi
 * components:
 *   schemas:
 *     APIversion:
 *       type: object
 *       required:
 *         - title
 *         - version
 *       properties:
 *         id:
 *           type: number
 *         apiId:
 *           type: number
 *         title:
 *           type: string
 *         version:
 *           type: string
 *         spec:
 *           type: object
 *         live:
 *           type: boolean
 *         deprecated:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     APIversionPatch:
 *       type: object
 *       required:
 *         - id
 *         - live
 *         - deprecated
 *         - deleted
 *       properties:
 *         id:
 *           type: number
 *         live:
 *           type: boolean
 *         deprecated:
 *           type: boolean
 *         deleted:
 *           type: boolean
 */

/** @openapi
 * components:
 *   schemas:
 *     ApiDocsItems:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         info:
 *           type: string
 *         image:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     APIdocLegacy:
 *       type: object
 *       required:
 *         - rows
 *         - pagination
 *       properties:
 *         title:
 *           type: string
 *         info:
 *           type: string
 *         target:
 *           type: string
 *           enum: [product_intro, feature, use_case, highlight]
 *         image:
 *           type: string
 */
