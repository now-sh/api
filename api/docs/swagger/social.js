/**
 * @swagger
 * /social/github/user/{username}:
 *   get:
 *     summary: Get GitHub user profile
 *     description: Fetches public profile information for any GitHub user
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *         example: octocat
 *     responses:
 *       200:
 *         description: GitHub user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: string
 *                   example: "octocat"
 *                 id:
 *                   type: integer
 *                   example: 583231
 *                 avatar_url:
 *                   type: string
 *                   example: "https://avatars.githubusercontent.com/u/583231?v=4"
 *                 name:
 *                   type: string
 *                   example: "The Octocat"
 *                 company:
 *                   type: string
 *                   example: "@github"
 *                 blog:
 *                   type: string
 *                   example: "https://github.blog"
 *                 location:
 *                   type: string
 *                   example: "San Francisco"
 *                 bio:
 *                   type: string
 *                   example: null
 *                 public_repos:
 *                   type: integer
 *                   example: 8
 *                 public_gists:
 *                   type: integer
 *                   example: 8
 *                 followers:
 *                   type: integer
 *                   example: 10000
 *                 following:
 *                   type: integer
 *                   example: 9
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2011-01-25T18:44:36Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found"
 *                 documentation_url:
 *                   type: string
 *                   example: "https://docs.github.com/rest"
 */

/**
 * @swagger
 * /social/github/users/{username}/repos:
 *   get:
 *     summary: Get user's repositories
 *     description: Lists public repositories for the specified user
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *         example: octocat
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *         description: Results per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created, updated, pushed, full_name]
 *           default: created
 *         description: Sort repositories by
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of repositories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1296269
 *                   name:
 *                     type: string
 *                     example: "Hello-World"
 *                   full_name:
 *                     type: string
 *                     example: "octocat/Hello-World"
 *                   description:
 *                     type: string
 *                     example: "My first repository on GitHub!"
 *                   private:
 *                     type: boolean
 *                     example: false
 *                   fork:
 *                     type: boolean
 *                     example: false
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   pushed_at:
 *                     type: string
 *                     format: date-time
 *                   size:
 *                     type: integer
 *                     example: 180
 *                   stargazers_count:
 *                     type: integer
 *                     example: 80
 *                   watchers_count:
 *                     type: integer
 *                     example: 80
 *                   language:
 *                     type: string
 *                     example: "C"
 *                   forks_count:
 *                     type: integer
 *                     example: 9
 *                   topics:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["octocat", "api", "github"]
 */

/**
 * @swagger
 * /social/blogs:
 *   get:
 *     summary: Get blog aggregator
 *     description: Returns recent blog posts from various tech blogs
 *     tags: [Social]
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [dev.to, hashnode, medium, all]
 *           default: all
 *         description: Filter by blog source
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag/topic
 *         example: javascript
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of posts to return
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
 *                           title:
 *                             type: string
 *                             example: "Understanding React Hooks"
 *                           url:
 *                             type: string
 *                             example: "https://dev.to/user/understanding-react-hooks"
 *                           author:
 *                             type: string
 *                             example: "John Doe"
 *                           source:
 *                             type: string
 *                             example: "dev.to"
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["react", "javascript", "webdev"]
 *                           published_at:
 *                             type: string
 *                             format: date-time
 *                           reading_time:
 *                             type: integer
 *                             example: 5
 *                           excerpt:
 *                             type: string
 *                             example: "A comprehensive guide to React Hooks..."
 *                     count:
 *                       type: integer
 *                       example: 20
 */