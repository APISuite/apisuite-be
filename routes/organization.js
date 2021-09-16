const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const { actions, possessions, resources } = require('../util/enums')
const controllers = require('../controllers')
const { accessControl, loggedIn } = require('../middleware')
const {
  validateOrgBody,
  validateAssignUserBody,
  validateOrganizationUpdateBody,
} = require('./validation_schemas/organization.schema')
const { validateInviteBody } = require('./validation_schemas/invite_organization.schema')
const organizationAppRoutes = require('./organization.app')

router.use('/:id/apps', organizationAppRoutes)

/**
 * @openapi
 * /organizations/publishers:
 *   get:
 *     summary: Get list of public app publishers
 *     tags: [Organization]
 *     responses:
 *       200:
 *         description: Public app publishers list
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: number
 *                    name:
 *                     type: string
 */
router.getAsync('/publishers',
  controllers.organization.listPublishers)

/**
 * @openapi
 * /organizations/publishers/{id}:
 *   get:
 *     summary: Get publisher details
 *     tags: [Organization]
 *     parameters:
 *       - name: id
 *         description: Publisher id
 *         required: true
 *         in: path
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Public app publishers details
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: number
 *                    name:
 *                     type: string
 *                    description:
 *                      type: string
 *                    logo:
 *                      type: string
 *                      format: uri
 *                    tosUrl:
 *                      type: string
 *                      format: uri
 *                    privacyUrl:
 *                      type: string
 *                      format: uri
 *                    youtubeUrl:
 *                      type: string
 *                      format: uri
 *                    websiteUrl:
 *                      type: string
 *                      format: uri
 *                    supportUrl:
 *                      type: string
 *                      format: uri
 */
router.getAsync('/publishers/:id',
  controllers.organization.getPublisher)

/**
 * @openapi
 * /organizations:
 *   get:
 *     description: Get list of organizations
 *     tags: [Organization]
 *     parameters:
 *       - name: page
 *         description: The page we are at.
 *         in: query
 *         schema:
 *           type: number
 *       - name: pageSize
 *         description: The number of documents per page.
 *         in: query
 *         schema:
 *           type: number
 *       - name: include
 *         description: Optional extra data inclusion.
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [appCount]
 *           description: >
 *             Include:
 *             * `appCount` - Include application count per organization. Only usable by role ADMIN.
 *             Usage: ?include[]=appCount or ?include=appCount&include=otherProp
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.ORGANIZATION),
  controllers.organization.getAll)

/**
 * @openapi
 * /organizations/{orgId}:
 *   get:
 *     description: Get organization by id.
 *     tags: [Organization]
 *     parameters:
 *       - name: orgId
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:orgId',
  loggedIn,
  accessControl(actions.READ, possessions.ANY, resources.ORGANIZATION),
  controllers.organization.getById)

/**
 * @openapi
 * /organizations:
 *   post:
 *     description: Add new organization.
 *     tags: [Organization]
 *     requestBody:
 *       description: Organization object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Organization"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: The created organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/',
  loggedIn,
  validateOrgBody,
  controllers.organization.addOrg)

/**
 * @openapi
 * /organizations/{id}:
 *   put:
 *     description: Update organization.
 *     tags: [Organization]
 *     parameters:
 *       - name: id
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: number
 *     requestBody:
 *       description: Organization object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Organization"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The updated organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.putAsync('/:id',
  loggedIn,
  validateOrganizationUpdateBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  controllers.organization.updateOrg)

/**
 * @openapi
 * /organizations/{orgId}:
 *   delete:
 *     description: Delete organization.
 *     tags: [Organization]
 *     parameters:
 *       - name: orgId
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: number
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: No Content
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.deleteAsync('/:orgId',
  loggedIn,
  accessControl(actions.DELETE, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'orgId' }),
  controllers.organization.deleteOrg)

/**
 * @openapi
 * /organizations/assign:
 *   post:
 *     description: Add user to organization.
 *     tags: [Organization]
 *     requestBody:
 *       description: User organization association
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserOrganization"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The user organization relation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserOrganization'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.postAsync('/assign',
  loggedIn,
  validateAssignUserBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'body', idField: 'org_id' }),
  controllers.organization.assignUserToOrg)

/**
 * @openapi
 * /organizations/{id}/users:
 *   get:
 *     description: Get list of organization users
 *     tags: [Organization]
 *     parameters:
 *       - name: id
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of organization users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationMembers'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/Internal'
 */
router.getAsync('/:id/users',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  controllers.organization.getAllMembers)

/**
 * @openapi
 * /organizations/{id}/users:
 *   post:
 *     description: Invite user to organization
 *     tags: [Organization]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Invitation data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Invite.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invite'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.postAsync('/:id/users',
  loggedIn,
  validateInviteBody,
  accessControl(actions.UPDATE, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  controllers.user.inviteUserToOrganization)

/**
 * @openapi
 * /organizations/{id}/users/{userId}:
 *   delete:
 *     summary: Remove user from organization
 *     description: Removes a user from an organization. Usable by organization owners on the target organization OR
 *        by lower level roles if they belong to the target organization and if are self removing from it.
 *        Organization owners (and admins) can’t remove themselves from organizations if they are the last owner/admin there (delete the organization instead).
 *     tags: [Organization]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *       - name: userId
 *         description: User ID
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.deleteAsync('/:id/users/:userId',
  loggedIn,
  controllers.organization.removeUserFromOrganization)

/**
 * @openapi
 * /organizations/{id}/invites:
 *   get:
 *     description: Get list of organization's pending user invites
 *     tags: [Organization]
 *     parameters:
 *       - name: id
 *         description: The organization id.
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of organization user invites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationInvites'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/NotFound'
 */
router.getAsync('/:id/invites',
  loggedIn,
  accessControl(actions.READ, possessions.OWN, resources.ORGANIZATION, { idCarrier: 'params', idField: 'id' }),
  controllers.organization.getPendingInvites)

module.exports = router
