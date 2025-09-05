/**
 * @swagger
 * /data/todos/public:
 *   get:
 *     summary: Get public todos
 *     description: Returns a list of public todo items
 *     tags: [Data]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of todos to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, all]
 *           default: all
 *         description: Filter by todo status
 *     responses:
 *       200:
 *         description: List of public todos
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
 *                     todos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "todo_123"
 *                           title:
 *                             type: string
 *                             example: "Complete API documentation"
 *                           description:
 *                             type: string
 *                             example: "Document all endpoints with Swagger"
 *                           status:
 *                             type: string
 *                             enum: [pending, completed]
 *                             example: "pending"
 *                           priority:
 *                             type: string
 *                             enum: [low, medium, high]
 *                             example: "high"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-12-25T12:00:00Z"
 *                     count:
 *                       type: integer
 *                       example: 10
 */

/**
 * @swagger
 * /data/todos:
 *   get:
 *     summary: Get user todos
 *     description: Returns authenticated user's todo items
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of todos to return
 *     responses:
 *       200:
 *         description: User's todos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodosResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Create a new todo
 *     description: Creates a new todo item for authenticated user
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Complete project"
 *               description:
 *                 type: string
 *                 example: "Finish all features by Friday"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Todo created successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /data/notes:
 *   get:
 *     summary: Get user notes
 *     description: Returns authenticated user's notes
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of notes to return
 *     responses:
 *       200:
 *         description: User's notes
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
 *                     notes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "note_123"
 *                           title:
 *                             type: string
 *                             example: "Meeting Notes"
 *                           content:
 *                             type: string
 *                             example: "Discussed project timeline and deliverables..."
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["work", "important"]
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Create a new note
 *     description: Creates a new note for authenticated user
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "API Ideas"
 *               content:
 *                 type: string
 *                 example: "Ideas for new API endpoints..."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["api", "development"]
 *     responses:
 *       201:
 *         description: Note created successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /data/urls:
 *   get:
 *     summary: Get URL shortener info
 *     description: Returns information about the URL shortener service
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: URL shortener service info
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
 *                     title:
 *                       type: string
 *                       example: "URL Shortener Service"
 *                     endpoints:
 *                       type: object
 *                       properties:
 *                         shorten:
 *                           type: string
 *                           example: "POST /api/v1/data/urls/shorten"
 *                         redirect:
 *                           type: string
 *                           example: "GET /api/v1/data/urls/:shortCode"
 *                         stats:
 *                           type: string
 *                           example: "GET /api/v1/data/urls/stats/:shortCode"
 */

/**
 * @swagger
 * /data/urls/shorten:
 *   post:
 *     summary: Shorten a URL
 *     description: Creates a shortened URL
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/very/long/url/that/needs/shortening"
 *               custom_code:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9-_]{3,20}$'
 *                 example: "my-link"
 *                 description: Custom short code (optional)
 *     responses:
 *       200:
 *         description: URL shortened successfully
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
 *                     short_url:
 *                       type: string
 *                       example: "https://api.example.com/s/abc123"
 *                     short_code:
 *                       type: string
 *                       example: "abc123"
 *                     original_url:
 *                       type: string
 *                       example: "https://example.com/very/long/url/that/needs/shortening"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */