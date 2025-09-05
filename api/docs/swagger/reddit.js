/**
 * @swagger
 * /social/reddit/r/{subreddit}:
 *   get:
 *     summary: Get subreddit posts
 *     description: Fetches recent posts from a specified subreddit using OAuth if configured, otherwise falls back to RSS feeds
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: subreddit
 *         required: true
 *         schema:
 *           type: string
 *         description: The subreddit name (without r/ prefix)
 *         example: programming
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of posts to return
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Bypass cache and fetch fresh data
 *     responses:
 *       200:
 *         description: Array of Reddit posts
 *         headers:
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS]
 *             description: Cache status
 *           X-Reddit-Source:
 *             schema:
 *               type: string
 *               enum: [oauth, json, rss, fallback]
 *             description: Data source used
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: t3_1234567
 *                   title:
 *                     type: string
 *                     example: "An interesting programming article"
 *                   author:
 *                     type: string
 *                     example: username123
 *                   url:
 *                     type: string
 *                     example: "https://example.com/article"
 *                   permalink:
 *                     type: string
 *                     example: "/r/programming/comments/1234567/an_interesting_programming_article/"
 *                   subreddit:
 *                     type: string
 *                     example: programming
 *                   created_utc:
 *                     type: integer
 *                     example: 1609459200
 *                   score:
 *                     type: integer
 *                     example: 42
 *                   num_comments:
 *                     type: integer
 *                     example: 10
 *                   is_self:
 *                     type: boolean
 *                     example: false
 *                   selftext:
 *                     type: string
 *                     example: ""
 *       404:
 *         description: Subreddit not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No posts found"
 *                 message:
 *                   type: string
 *                   example: "Subreddit not found or no posts available"
 *       503:
 *         description: Reddit API unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Reddit API unavailable"
 *                 message:
 *                   type: string
 *                   example: "Reddit is blocking unauthenticated requests. Authentication required for real data."
 */

/**
 * @swagger
 * /social/reddit/u/{username}:
 *   get:
 *     summary: Get Reddit user information
 *     description: Fetches information about a Reddit user
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Reddit username
 *         example: spez
 *     responses:
 *       200:
 *         description: Reddit user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: spez
 *                     created_utc:
 *                       type: integer
 *                       example: 1118030400
 *                     link_karma:
 *                       type: integer
 *                       example: 100000
 *                     comment_karma:
 *                       type: integer
 *                       example: 50000
 *                 message:
 *                   type: string
 *                   example: "User info retrieved"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagger
 * /social/reddit/cache/stats:
 *   get:
 *     summary: Get Reddit cache statistics
 *     description: Returns cache statistics for Reddit API endpoints
 *     tags: [Social]
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
 *                     title:
 *                       type: string
 *                       example: "API Response Cache Statistics"
 *                     stats:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: integer
 *                           example: 150
 *                         misses:
 *                           type: integer
 *                           example: 75
 *                         keys:
 *                           type: integer
 *                           example: 25
 *                         ksize:
 *                           type: integer
 *                           example: 2048
 *                         vsize:
 *                           type: integer
 *                           example: 16384
 *                     cache_ttl:
 *                       type: string
 *                       example: "5 minutes for Reddit endpoints"
 *                     message:
 *                       type: string
 *                       example: "Use ?refresh=true on any endpoint to bypass cache"
 */

/**
 * @swagger
 * /social/reddit/cache/clear:
 *   delete:
 *     summary: Clear Reddit cache
 *     description: Clears cached Reddit API responses
 *     tags: [Social]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
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
 *                     message:
 *                       type: string
 *                       example: "Cleared 15 Reddit cache entries"
 *                     success:
 *                       type: boolean
 *                       example: true
 */