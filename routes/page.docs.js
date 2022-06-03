/**
 * @openapi
 * components:
 *   schemas:
 *     Page:
 *       type: object
 *       required:
 *         - id
 *         - string
 *         - content
 *       properties:
 *         id:
 *           type: string
 *         locale:
 *           type: string
 *         content:
 *           type: string
 *         title:
 *           type: string
 *         parent:
 *           type: string
 *         online:
 *           type: boolean
 *         updatedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *
 *     NewPage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         locale:
 *           type: string
 *         content:
 *           type: string
 *         title:
 *           type: string
 *         parent:
 *           type: string
 *         online:
 *           type: boolean
 *     SimplePage:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         id:
 *           type: string
 *         locale:
 *           type: string
 *         online:
 *           type: boolean
 *         updatedAt:
 *           type: string
 *         createdAt:
 *           type: string
 */
