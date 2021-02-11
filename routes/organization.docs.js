// Documentation for organization endpoint models

/**
 * @openapi
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         vat:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *         logo:
 *           type: string
 *           format: uri
 *         org_code:
 *           type: string
 *         app_count:
 *           type: number
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
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserOrganization:
 *       type: object
 *       required:
 *         - user_id
 *         - org_id
 *       properties:
 *         user_id:
 *           type: string
 *         org_id:
 *           type: string
 *         role_id:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     OrganizationMembers:
 *       type: array
 *       items:
 *         type: object
 *         required:
 *           - User
 *           - Organization
 *           - Role
 *           - created_at
 *           - updated_at
 *         properties:
 *           User:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               id:
 *                 type: number
 *           Organization:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               id:
 *                 type: number
 *           Role:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               id:
 *                 type: number
 *           created_at:
 *             type: string
 *           updated_at:
 *             type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     OrganizationInvites:
 *       type: array
 *       items:
 *         type: object
 *         required:
 *           - email
 *         properties:
 *            email:
 *              type: string
 *              format: email
 */
