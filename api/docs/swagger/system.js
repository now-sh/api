/**
 * @swagger
 * /version:
 *   get:
 *     summary: Get API version and health information
 *     description: Returns version, system health, database status, and service configuration
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.9.4"
 *                     name:
 *                       type: string
 *                       example: "CasJay API"
 *                     description:
 *                       type: string
 *                       example: "A comprehensive API service"
 *                     environment:
 *                       type: string
 *                       example: "production"
 *                     nodejs:
 *                       type: string
 *                       example: "v18.17.0"
 *                     uptime:
 *                       type: number
 *                       example: 3600
 *                     routes:
 *                       type: object
 *                       properties:
 *                         tools:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["base64", "hash", "uuid", "jwt", "qr", "color", "lorem", "passwd"]
 *                         world:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["covid", "disease", "timezones", "usa", "nys"]
 *                         social:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["github", "reddit", "blogs"]
 *                         fun:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["jokes", "facts", "trivia", "anime"]
 */

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Returns statistics about the API cache
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     caches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "reddit"
 *                           stats:
 *                             type: object
 *                             properties:
 *                               hits:
 *                                 type: integer
 *                                 example: 1500
 *                               misses:
 *                                 type: integer
 *                                 example: 300
 *                               keys:
 *                                 type: integer
 *                                 example: 45
 *                               ksize:
 *                                 type: integer
 *                                 example: 2048
 *                               vsize:
 *                                 type: integer
 *                                 example: 65536
 *                           ttl:
 *                             type: integer
 *                             example: 300
 *                     total:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: integer
 *                           example: 5000
 *                         misses:
 *                           type: integer
 *                           example: 1000
 *                         keys:
 *                           type: integer
 *                           example: 150
 */

/**
 * @swagger
 * /cache/clear:
 *   delete:
 *     summary: Clear all caches
 *     description: Clears all API caches (requires authentication)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caches cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All caches cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cleared:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["reddit", "responses", "general"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */