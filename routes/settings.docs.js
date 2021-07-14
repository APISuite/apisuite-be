// Documentation for settings endpoints

/**
 * @openapi
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         portalName:
 *           type: string
 *         clientName:
 *           type: string
 *         documentationURL:
 *           type: string
 *         supportURL:
 *           type: string
 *         socialURLs:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - name
 *               - url
 *             properties:
 *               name:
 *                 type: string
 *                 enum:
 *                   - web
 *                   - github
 *                   - gitlab
 *                   - facebook
 *                   - twitter
 *                   - linkedin
 *                   - reddit
 *                   - instagram
 *                   - other
 *               url:
 *                 type: string
 *                 format: uri
 *         sso:
 *           type: array
 *           items:
 *             type: string
 *             enum: [keycloak]
 *         providerSignupURL:
 *           type: string
 *           format: uri
 *
 *     IdPSettings:
 *       type: object
 *       required:
 *         - provider
 *         - configuration
 *       properties:
 *         provider:
 *           type: string
 *           enum:
 *             - internal
 *             - keycloak
 *         configuration:
 *           oneOf:
 *             - $ref: '#/components/schemas/Internal'
 *             - $ref: '#/components/schemas/Keycloak'
 *             - $ref: '#/components/schemas/KeycloakPreConfigured'
 *           discriminator:
 *             propertyName: provider
 *
 *     Internal:
 *       type: object
 *
 *     Keycloak:
 *       type: object
 *       properties:
 *         discoveryURL:
 *           type: string
 *           format: uri
 *         initialAccessToken:
 *           type: string
 *         ssoEnabled:
 *           type: boolean
 *         providerSignupURL:
 *           type: string
 *           format: uri
 *         preConfiguredClient:
 *           type: object
 *           required:
 *             - clientId
 *             - clientSecret
 *             - clientData
 *           properties:
 *             clientId:
 *               type: string
 *             clientSecret:
 *               type: string
 *             extra:
 *               type: object
 *               required:
 *                 - registration_client_uri
 *                 - registration_access_token
 *               properties:
 *                 registration_client_uri:
 *                   type: string
 *                 registration_access_token:
 *                   type: string
 *
 *     GatewaySettings:
 *       type: object
 *       required:
 *         - provider
 *         - configuration
 *       properties:
 *         provider:
 *           type: string
 *           enum:
 *             - kong
 *         configuration:
 *           oneOf:
 *             - $ref: '#/components/schemas/Kong'
 *           discriminator:
 *             propertyName: provider
 *
 *     Kong:
 *       type: object
 *       required:
 *         - url
 *         - apiKey
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *         apiKey:
 *           type: string
 *
 *     GatewaySync:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 */
