// Documentation for users endpoint models

/** @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         bio:
 *           type: string
 *         mobile:
 *           type: string
 *         avatar:
 *           type: string
 *           format: uri
 *         last_login:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     UserCompact:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - bio
 *         - email
 *         - mobile
 *         - avatar
 *         - last_login
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         bio:
 *           type: string
 *         mobile:
 *           type: string
 *         avatar:
 *           type: string
 *           format: uri
 *         last_login:
 *           type: string
 *           format: date-time
 *         oidcProvider:
 *           type: string
 *         oidcId:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *         avatar:
 *           type: string
 *           format: uri
 *         mobile:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - user
 *         - org_member
 *         - current_org
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserCompact'
 *         ssoAccountURL:
 *           type: string
 *           format: uri
 *         org_member:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               name:
 *                 type: string
 *         organizations:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id:
 *                  type: number
 *                name:
 *                  type: string
 *                role:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: number
 *                    name:
 *                      type: string
 *                   level:
 *                      type: number
 *                      description: Role's hierarchy position. Lower value = higher position.
 *         current_org:
 *           type: object
 *           deprecated: true
 *           properties:
 *             id:
 *               type: number
 *             name:
 *               type: string
 *             member_since:
 *               type: string
 *               format: date-time
 *             role:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     Invite:
 *       type: object
 *       properties:
 *         user_id:
 *           type: number
 *         org_id:
 *           type: number
 *         role_id:
 *           type: number
 *         email:
 *           type: string
 *           format: email
 *         status:
 *           type: string
 *         confirmation_token:
 *           type: string
 *           format: uuid
 */

/** @openapi
 * components:
 *   schemas:
 *     InviteCompact:
 *       type: object
 *       properties:
 *         user_id:
 *           type: number
 *         email:
 *           type: string
 *           format: email
 *         status:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     SettingsSetup:
 *       type: object
 *       properties:
 *         portalName:
 *           type: string
 *         clientName:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     OrganizationSetup:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *         vat:
 *           type: string
 */

/** @openapi
 * components:
 *   schemas:
 *     APIToken:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *
 *     APITokenFull:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         token:
 *           type: string
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 */
