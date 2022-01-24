// Documentation for role endpoint models

/**
 * @openapi
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         level:
 *           type: number
 *           description: Role's hierarchy position. Lower value = higher position.
 *
 *     NewRole:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         grants:
 *           type: object
 */
