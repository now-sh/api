/**
 * @swagger
 * /tools/base64/encode:
 *   post:
 *     summary: Encode text to Base64
 *     description: Encodes a text string to Base64 format
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to encode
 *                 example: "Hello World"
 *     responses:
 *       200:
 *         description: Successfully encoded
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
 *                     encoded:
 *                       type: string
 *                       example: "SGVsbG8gV29ybGQ="
 *                     original:
 *                       type: string
 *                       example: "Hello World"
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /tools/base64/decode:
 *   post:
 *     summary: Decode Base64 to text
 *     description: Decodes a Base64 string back to text
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Base64 text to decode
 *                 example: "SGVsbG8gV29ybGQ="
 *     responses:
 *       200:
 *         description: Successfully decoded
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
 *                     decoded:
 *                       type: string
 *                       example: "Hello World"
 *                     original:
 *                       type: string
 *                       example: "SGVsbG8gV29ybGQ="
 */

/**
 * @swagger
 * /tools/uuid/v4:
 *   get:
 *     summary: Generate UUID v4
 *     description: Generates a random UUID v4
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: Successfully generated UUID
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
 *                     uuid:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 */

/**
 * @swagger
 * /tools/uuid/generate/{count}:
 *   get:
 *     summary: Generate multiple UUIDs
 *     description: Generates multiple UUID v4s
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of UUIDs to generate
 *         example: 5
 *     responses:
 *       200:
 *         description: Successfully generated UUIDs
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
 *                     uuids:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                       example: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"]
 *                     count:
 *                       type: integer
 *                       example: 2
 */

/**
 * @swagger
 * /tools/hash/{algorithm}:
 *   post:
 *     summary: Generate hash
 *     description: Generates a hash of the input text using the specified algorithm
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: algorithm
 *         required: true
 *         schema:
 *           type: string
 *           enum: [md5, sha1, sha256, sha512]
 *         description: Hash algorithm to use
 *         example: sha256
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to hash
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successfully generated hash
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
 *                     hash:
 *                       type: string
 *                       example: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
 *                     algorithm:
 *                       type: string
 *                       example: "sha256"
 *                     text:
 *                       type: string
 *                       example: "password123"
 */

/**
 * @swagger
 * /tools/passwd/{length}:
 *   get:
 *     summary: Generate password
 *     description: Generates a random password of specified length
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: length
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 4
 *           maximum: 128
 *           default: 16
 *         description: Password length
 *         example: 16
 *     responses:
 *       200:
 *         description: Successfully generated password
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
 *                     password:
 *                       type: string
 *                       example: "xK9#mP2$nL7@qR5!"
 *                     length:
 *                       type: integer
 *                       example: 16
 *                     strength:
 *                       type: string
 *                       enum: [weak, medium, strong, very strong]
 *                       example: "very strong"
 */

/**
 * @swagger
 * /tools/qr/generate:
 *   post:
 *     summary: Generate QR Code
 *     description: Generates a QR code from text
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to encode in QR code
 *                 example: "https://example.com"
 *               size:
 *                 type: integer
 *                 description: Size of QR code in pixels
 *                 default: 200
 *                 example: 300
 *               format:
 *                 type: string
 *                 enum: [png, svg, ascii]
 *                 default: png
 *                 description: Output format
 *     responses:
 *       200:
 *         description: Successfully generated QR code
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
 *                     qrCode:
 *                       type: string
 *                       description: Base64 encoded QR code image (for png/svg) or ASCII art
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                     format:
 *                       type: string
 *                       example: "png"
 *                     text:
 *                       type: string
 *                       example: "https://example.com"
 *                     size:
 *                       type: integer
 *                       example: 300
 */

/**
 * @swagger
 * /tools/lorem/paragraphs/{count}:
 *   get:
 *     summary: Generate Lorem Ipsum paragraphs
 *     description: Generates Lorem Ipsum placeholder text paragraphs
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         description: Number of paragraphs to generate
 *         example: 3
 *     responses:
 *       200:
 *         description: Successfully generated Lorem Ipsum
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
 *                     text:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Lorem ipsum dolor sit amet...", "Consectetur adipiscing elit..."]
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     type:
 *                       type: string
 *                       example: "paragraphs"
 */