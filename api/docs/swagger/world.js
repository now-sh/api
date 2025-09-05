/**
 * @swagger
 * /world/covid:
 *   get:
 *     summary: Get global COVID-19 statistics
 *     description: Returns current global COVID-19 statistics including cases, deaths, and recoveries
 *     tags: [World]
 *     responses:
 *       200:
 *         description: Global COVID-19 statistics
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
 *                       example: "Global COVID-19 Statistics"
 *                     global:
 *                       type: object
 *                       properties:
 *                         cases:
 *                           type: integer
 *                           example: 704000000
 *                         deaths:
 *                           type: integer
 *                           example: 7000000
 *                         recovered:
 *                           type: integer
 *                           example: 680000000
 *                         active:
 *                           type: integer
 *                           example: 17000000
 *                         critical:
 *                           type: integer
 *                           example: 50000
 *                         todayCases:
 *                           type: integer
 *                           example: 100000
 *                         todayDeaths:
 *                           type: integer
 *                           example: 2000
 *                         todayRecovered:
 *                           type: integer
 *                           example: 95000
 *                         updated:
 *                           type: integer
 *                           example: 1609459200000
 */

/**
 * @swagger
 * /world/disease:
 *   get:
 *     summary: Disease.sh API proxy
 *     description: General proxy to disease.sh API v3 endpoints. Use specific paths like /world/disease/covid-19/countries for COVID data.
 *     tags: [World]
 *     responses:
 *       200:
 *         description: Response from disease.sh API
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   example: "Page not found."
 */

/**
 * @swagger
 * /world/disease/covid/all:
 *   get:
 *     summary: Get global COVID-19 statistics
 *     description: Returns current global COVID-19 statistics from disease.sh
 *     tags: [World]
 *     responses:
 *       200:
 *         description: Global COVID-19 statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *                   example: 1634567890123
 *                 cases:
 *                   type: integer
 *                   example: 704753890
 *                 todayCases:
 *                   type: integer
 *                   example: 123456
 *                 deaths:
 *                   type: integer
 *                   example: 7010681
 *                 todayDeaths:
 *                   type: integer
 *                   example: 1234
 *                 recovered:
 *                   type: integer
 *                   example: 675619811
 *                 todayRecovered:
 *                   type: integer
 *                   example: 123456
 *                 active:
 *                   type: integer
 *                   example: 22123398
 *                 critical:
 *                   type: integer
 *                   example: 91234
 *                 casesPerOneMillion:
 *                   type: number
 *                   example: 89912.34
 *                 deathsPerOneMillion:
 *                   type: number
 *                   example: 894.12
 *                 tests:
 *                   type: integer
 *                   example: 7012345678901
 *                 testsPerOneMillion:
 *                   type: number
 *                   example: 894567.12
 *                 population:
 *                   type: integer
 *                   example: 7837763791
 *                 affectedCountries:
 *                   type: integer
 *                   example: 230
 */

/**
 * @swagger
 * /world/disease/{path}:
 *   get:
 *     summary: Disease.sh API proxy (any endpoint)
 *     description: |
 *       Proxies any disease.sh v3 API endpoint. Examples:
 *       - /world/disease/covid-19/countries - All countries COVID data
 *       - /world/disease/covid-19/countries/USA - USA COVID data
 *       - /world/disease/covid-19/states - US states data
 *       - /world/disease/covid-19/vaccine - Vaccine data
 *     tags: [World]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The disease.sh API path to proxy
 *         example: covid-19/countries/USA
 *     responses:
 *       200:
 *         description: Response from disease.sh API
 *       404:
 *         description: Endpoint not found
 */

/**
 * @swagger
 * /world/usa/nys:
 *   get:
 *     summary: Get New York State COVID-19 data
 *     description: Returns COVID-19 statistics for New York State
 *     tags: [World]
 *     responses:
 *       200:
 *         description: New York State COVID-19 statistics
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
 *                       example: "New York State COVID-19 Data"
 *                     nys:
 *                       type: object
 *                       properties:
 *                         state:
 *                           type: string
 *                           example: "New York"
 *                         cases:
 *                           type: integer
 *                           example: 5000000
 *                         deaths:
 *                           type: integer
 *                           example: 70000
 *                         recovered:
 *                           type: integer
 *                           example: 4800000
 *                         active:
 *                           type: integer
 *                           example: 130000
 *                         todayCases:
 *                           type: integer
 *                           example: 1000
 *                         todayDeaths:
 *                           type: integer
 *                           example: 10
 */

/**
 * @swagger
 * /world/usa/{state}:
 *   get:
 *     summary: Get US state COVID-19 data
 *     description: Returns COVID-19 statistics for a specific US state
 *     tags: [World]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: US state name
 *         example: California
 *     responses:
 *       200:
 *         description: State COVID-19 statistics
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
 *                     state:
 *                       type: string
 *                       example: "California"
 *                     cases:
 *                       type: integer
 *                       example: 10000000
 *                     deaths:
 *                       type: integer
 *                       example: 100000
 *                     recovered:
 *                       type: integer
 *                       example: 9500000
 *                     active:
 *                       type: integer
 *                       example: 400000
 */

/**
 * @swagger
 * /world/timezones:
 *   get:
 *     summary: Get all timezones
 *     description: Returns a list of all available timezones
 *     tags: [World]
 *     responses:
 *       200:
 *         description: List of timezones
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
 *                       example: "Available Timezones"
 *                     timezones:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["America/New_York", "Europe/London", "Asia/Tokyo"]
 */

/**
 * @swagger
 * /world/closings:
 *   get:
 *     summary: Get school closings
 *     description: Returns current school closing information
 *     tags: [World]
 *     responses:
 *       200:
 *         description: School closing information
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
 *                       example: "School Closings"
 *                     closings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           school:
 *                             type: string
 *                             example: "Springfield Elementary"
 *                           status:
 *                             type: string
 *                             example: "Closed"
 *                           reason:
 *                             type: string
 *                             example: "Weather"
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2023-12-25"
 */