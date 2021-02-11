// Documentation for registration endpoint models

/**
 * @openapi
 * components:
 *   schemas:
 *     UserDetails:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         bio:
 *           type: string
 *         avatar:
 *           type: string
 *         mobile:
 *           type: string
 *         token:
 *           type: string
 *           format: uuid
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     OrganizationDetails:
 *       type: object
 *       required:
 *         - name
 *         - registrationToken
 *       properties:
 *         name:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *         vat:
 *           type: string
 *         registrationToken:
 *           type: string
 *           format: uuid
 */
