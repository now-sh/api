/**
 * @swagger
 * /fun/jokes:
 *   get:
 *     summary: Get a random joke
 *     description: Returns a random joke from various categories
 *     tags: [Fun]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [programming, dad, general, knock-knock, pun]
 *         description: Joke category
 *         example: programming
 *     responses:
 *       200:
 *         description: A random joke
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
 *                     joke:
 *                       type: string
 *                       example: "Why do programmers prefer dark mode? Because light attracts bugs!"
 *                     category:
 *                       type: string
 *                       example: "programming"
 *                     id:
 *                       type: string
 *                       example: "joke_123"
 */

/**
 * @swagger
 * /fun/jokes/batch/{count}:
 *   get:
 *     summary: Get multiple random jokes
 *     description: Returns multiple random jokes
 *     tags: [Fun]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Number of jokes to return
 *         example: 5
 *     responses:
 *       200:
 *         description: Multiple random jokes
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
 *                     jokes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           joke:
 *                             type: string
 *                           category:
 *                             type: string
 *                           id:
 *                             type: string
 *                     count:
 *                       type: integer
 *                       example: 5
 */

/**
 * @swagger
 * /fun/facts:
 *   get:
 *     summary: Get a random fact
 *     description: Returns a random interesting fact
 *     tags: [Fun]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [science, history, nature, technology, space]
 *         description: Fact category
 *         example: science
 *     responses:
 *       200:
 *         description: A random fact
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
 *                     fact:
 *                       type: string
 *                       example: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible."
 *                     category:
 *                       type: string
 *                       example: "science"
 *                     source:
 *                       type: string
 *                       example: "National Geographic"
 */

/**
 * @swagger
 * /fun/trivia:
 *   get:
 *     summary: Get a trivia question
 *     description: Returns a random trivia question with multiple choice answers
 *     tags: [Fun]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, science, sports, history, geography, entertainment]
 *         description: Trivia category
 *         example: science
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Question difficulty
 *         example: medium
 *     responses:
 *       200:
 *         description: A trivia question
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
 *                     question:
 *                       type: string
 *                       example: "What is the chemical symbol for gold?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Au", "Ag", "Go", "Gd"]
 *                     correct_answer:
 *                       type: string
 *                       example: "Au"
 *                     category:
 *                       type: string
 *                       example: "science"
 *                     difficulty:
 *                       type: string
 *                       example: "medium"
 */

/**
 * @swagger
 * /fun/anime/quote:
 *   get:
 *     summary: Get a random anime quote
 *     description: Returns a random quote from various anime series
 *     tags: [Fun]
 *     responses:
 *       200:
 *         description: A random anime quote
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
 *                     quote:
 *                       type: string
 *                       example: "Believe it!"
 *                     character:
 *                       type: string
 *                       example: "Naruto Uzumaki"
 *                     anime:
 *                       type: string
 *                       example: "Naruto"
 */

/**
 * @swagger
 * /fun/anime/quotes/{count}:
 *   get:
 *     summary: Get multiple anime quotes
 *     description: Returns multiple random anime quotes
 *     tags: [Fun]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Number of quotes to return
 *         example: 3
 *     responses:
 *       200:
 *         description: Multiple anime quotes
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
 *                     quotes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           quote:
 *                             type: string
 *                           character:
 *                             type: string
 *                           anime:
 *                             type: string
 *                     count:
 *                       type: integer
 *                       example: 3
 */