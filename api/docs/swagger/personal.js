/**
 * @swagger
 * /me/info/profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the profile information of CasJay
 *     tags: [Personal]
 *     responses:
 *       200:
 *         description: User profile information
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
 *                     profile:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Jason Hempstead"
 *                         username:
 *                           type: string
 *                           example: "casjay"
 *                         email:
 *                           type: string
 *                           example: "jason@casjay.app"
 *                         bio:
 *                           type: string
 *                           example: "DevOps Engineer | Full Stack Developer | Open Source Enthusiast"
 *                         location:
 *                           type: string
 *                           example: "New York, USA"
 *                         website:
 *                           type: string
 *                           example: "https://casjay.app"
 *                         github:
 *                           type: string
 *                           example: "https://github.com/casjay"
 *                         twitter:
 *                           type: string
 *                           example: "https://twitter.com/casjay"
 */

/**
 * @swagger
 * /me/info/profile/text:
 *   get:
 *     summary: Get user profile as text
 *     description: Returns the profile information in plain text format
 *     tags: [Personal]
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: User profile in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 Name: Jason Hempstead
 *                 Username: casjay
 *                 Email: jason@casjay.app
 *                 Bio: DevOps Engineer | Full Stack Developer | Open Source Enthusiast
 *                 Location: New York, USA
 *                 Website: https://casjay.app
 */

/**
 * @swagger
 * /me/domains:
 *   get:
 *     summary: Get my domains
 *     description: Returns a list of domains owned by CasJay
 *     tags: [Personal]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of domains to return
 *     responses:
 *       200:
 *         description: List of domains
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
 *                     domains:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           domain:
 *                             type: string
 *                             example: "casjay.app"
 *                           status:
 *                             type: string
 *                             enum: [active, inactive, expired]
 *                             example: "active"
 *                           registrar:
 *                             type: string
 *                             example: "Namecheap"
 *                           expires:
 *                             type: string
 *                             format: date
 *                             example: "2025-12-31"
 *                           dns_provider:
 *                             type: string
 *                             example: "Cloudflare"
 *                     count:
 *                       type: integer
 *                       example: 15
 */

/**
 * @swagger
 * /me/blog:
 *   get:
 *     summary: Get my blog posts
 *     description: Returns blog posts by CasJay
 *     tags: [Personal]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of posts to return
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of blog posts
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
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "post_123"
 *                           title:
 *                             type: string
 *                             example: "Building Scalable APIs with Node.js"
 *                           slug:
 *                             type: string
 *                             example: "building-scalable-apis-nodejs"
 *                           excerpt:
 *                             type: string
 *                             example: "Learn how to build highly scalable APIs..."
 *                           category:
 *                             type: string
 *                             example: "Development"
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["nodejs", "api", "scalability"]
 *                           published_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-12-15T10:00:00Z"
 *                           reading_time:
 *                             type: integer
 *                             example: 8
 *                     count:
 *                       type: integer
 *                       example: 25
 */

/**
 * @swagger
 * /me/info/resume:
 *   get:
 *     summary: Get resume information
 *     description: Returns CasJay's resume data in JSON format
 *     tags: [Personal]
 *     responses:
 *       200:
 *         description: Resume information
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
 *                     personal:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Jason Hempstead"
 *                         title:
 *                           type: string
 *                           example: "Senior DevOps Engineer"
 *                         email:
 *                           type: string
 *                           example: "jason@casjay.app"
 *                         location:
 *                           type: string
 *                           example: "New York, USA"
 *                     summary:
 *                       type: string
 *                       example: "Experienced DevOps engineer with 10+ years..."
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Docker", "Kubernetes", "AWS", "Node.js", "Python"]
 *                     experience:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           company:
 *                             type: string
 *                           position:
 *                             type: string
 *                           duration:
 *                             type: string
 *                           description:
 *                             type: string
 */

/**
 * @swagger
 * /me/info/resume/view:
 *   get:
 *     summary: View resume as PDF
 *     description: Returns CasJay's resume as a PDF document
 *     tags: [Personal]
 *     produces:
 *       - application/pdf
 *     responses:
 *       200:
 *         description: Resume PDF document
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: "inline; filename=CasJay_Resume.pdf"
 */

/**
 * @swagger
 * /me/info/github:
 *   get:
 *     summary: Get my GitHub profile
 *     description: Returns CasJay's GitHub profile information
 *     tags: [Personal]
 *     responses:
 *       200:
 *         description: GitHub profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: string
 *                   example: "casjay"
 *                 name:
 *                   type: string
 *                   example: "Jason Hempstead"
 *                 bio:
 *                   type: string
 *                   example: "DevOps Engineer | Open Source Enthusiast"
 *                 public_repos:
 *                   type: integer
 *                   example: 150
 *                 followers:
 *                   type: integer
 *                   example: 500
 *                 following:
 *                   type: integer
 *                   example: 100
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2010-01-01T00:00:00Z"
 */