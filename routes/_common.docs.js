// Common APISuite API documentation

/**
 * @openapi
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       required:
 *         - errors
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Forbidden:
 *       description: Forbidden
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Conflict:
 *       description: Resource conflict
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Internal:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *
 *   securitySchemes:
 *     Bearer:
 *       type: apiKey
 *       name: Authorization
 *       in: header
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: access_token
 *     cookieRefreshAuth:
 *       type: apiKey
 *       in: cookie
 *       name: refresh_token
 *     x_access_token:
 *       type: apiKey
 *       name: x-access-token
 *       in: header
 *     x_app_token:
 *       type: apiKey
 *       name: x-app-token
 *       in: header
 *     x_internal_token:
 *       type: apiKey
 *       name: x-internal-token
 *       in: header
 *     x_setup_token:
 *       type: apiKey
 *       name: x-setup-token
 *       in: header
 */
