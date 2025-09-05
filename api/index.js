require('dotenv').config();
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');

const app = express();

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

const { connectToDatabase } = require('./db/connection');

// Initialize database connection immediately for serverless environments
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
if (isVercel) {
  connectToDatabase().catch(error => {
    console.warn('⚠️  Serverless database connection failed at startup:', error.message);
  });
}

const middlewares = require('./middleware/errorHandler');
const handlers = require('./middleware/defaultHandler');
const { defaultLimiter } = require('./middleware/rateLimiter');
const { formatResponse } = require('./middleware/responseFormatter');

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files (CSS, JS, images, etc.) - must be before other middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use(handlers.handlerRoute);
app.use(defaultLimiter);
app.use(formatResponse);

// Health check alias - calls version endpoint handler directly (must be before main route)
const { versionHandler } = require('./routes/apiRoute');
app.get('/healthz', cors(), versionHandler);
app.get('/api/healthz', cors(), versionHandler);

// Main routes
app.use('/', require('./routes/mainRoute'));
app.use('/api', require('./routes/apiRoute'));
app.use('/api/docs', require('./routes/docsRoute'));

// ==== API ROUTES ORGANIZED BY CATEGORY ====

// 🛠️ TOOLS - Developer Tools & Utilities
app.use('/api/v1/tools/base64', require('./routes/base64Route'));
app.use('/api/v1/tools/hash', require('./routes/hashRoute'));
app.use('/api/v1/tools/uuid', require('./routes/uuidRoute'));
app.use('/api/v1/tools/jwt', require('./routes/jwtRoute'));
app.use('/api/v1/tools/qr', require('./routes/qrRoute'));
app.use('/api/v1/tools/color', require('./routes/colorRoute'));
app.use('/api/v1/tools/lorem', require('./routes/loremRoute'));
app.use('/api/v1/tools/passwd', require('./routes/genpasswdRoute'));
app.use('/api/v1/tools/commit', require('./routes/commitRoute'));
app.use('/api/v1/tools/markdown', require('./routes/markdownRoute'));
app.use('/api/v1/tools/cron', require('./routes/cronRoute'));
app.use('/api/v1/tools/regex', require('./routes/regexRoute'));
app.use('/api/v1/tools/diff', require('./routes/diffRoute'));
app.use('/api/v1/tools/dictionary', require('./routes/dictionaryRoute'));

// 👤 ME - Your Personal Data
app.use('/api/v1/me/blog', require('./routes/blogRoute'));
app.use('/api/v1/data/blogs', require('./routes/blogRoute'));
app.use('/api/v1/me/domains', require('./routes/domainRoute'));
app.use('/api/v1/me/info', require('./routes/meInfoRoute'));

// 📊 DATA - Data Storage & Management
app.use('/api/v1/data/todos', require('./routes/todoRoute'));
app.use('/api/v1/data/notes', require('./routes/notesRoute'));
app.use('/api/v1/data/urls', require('./routes/urlRoute'));

// 🎮 FUN - Entertainment APIs
app.use('/api/v1/fun/jokes', require('./routes/jokesRoute'));
app.use('/api/v1/fun/facts', require('./routes/factsRoute'));
app.use('/api/v1/fun/trivia', require('./routes/triviaRoute'));
app.use('/api/v1/fun/anime', require('./routes/animeRoute'));

// 🌐 SOCIAL - Social Media APIs (any user)
app.use('/api/v1/social/blogs', require('./routes/blogsRoute'));
app.use('/api/v1/social/github', require('./routes/githubRoute'));
app.use('/api/v1/social/reddit', require('./routes/redditRoute'));

// 🌍 WORLD - World Information
app.use('/api/v1/world/covid', require('./routes/covidRoute'));
app.use('/api/v1/world/disease', require('./routes/diseaseRoute'));
app.use('/api/v1/world/closings', require('./routes/closingsRoute'));
app.use('/api/v1/world/timezones', require('./routes/timezoneRoute'));
app.use('/api/v1/world/usa', require('./routes/usaRoute'));
app.use('/api/v1/world/usa/nys', require('./routes/nysRoute'));
app.use('/api/v1/world/nys', require('./routes/nysRoute'));
app.use('/api/v1/world/arcgis', require('./routes/arcgisRoute'));

// 🔐 AUTH - Authentication & Profile
app.use('/api/v1/auth', require('./routes/authRoute'));
app.use('/api/v1/profile', require('./routes/profileRoute'));

// 🏥 SYSTEM - System Info
app.use('/api/v1/version', require('./routes/apiRoute'));
app.use('/api/v1/cache', require('./routes/cacheRoute'));
app.use('/api/v1/docs', require('./routes/swaggerRoute'));
app.use('/api/v1/debug', require('./routes/debugRoute'));



// ==== FRONTEND ROUTES ====
// These serve the interactive frontend pages for API endpoints

// Utility frontend pages
app.get('/utilities/base64', (req, res) => res.render('pages/utilities/base64'));
app.get('/utilities/hash', (req, res) => res.render('pages/utilities/hash'));
app.get('/utilities/uuid', (req, res) => res.render('pages/utilities/uuid'));
app.get('/utilities/jwt', (req, res) => res.render('pages/utilities/jwt'));
app.get('/utilities/qr', (req, res) => res.render('pages/utilities/qr'));
app.get('/utilities/color', (req, res) => res.render('pages/utilities/color'));
app.get('/utilities/lorem', (req, res) => res.render('pages/utilities/lorem'));
app.get('/utilities/passwd', (req, res) => res.render('pages/utilities/passwd'));

// Tool frontend pages
app.get('/tools/commit', (req, res) => res.render('pages/tools/commit'));

// Data frontend pages
app.get('/data/git', (req, res) => res.render('pages/data/git'));
app.get('/data/reddit', (req, res) => res.render('pages/data/reddit'));
app.get('/world/covid', (req, res) => res.render('pages/world/covid'));
app.get('/data/anime', (req, res) => res.render('pages/fun/anime'));
app.get('/data/domains', (req, res) => res.render('pages/data/domains'));
app.get('/world/timezones', (req, res) => res.render('pages/world/timezones'));
app.get('/data/closings', (req, res) => res.render('pages/world/closings'));
app.get('/data/blogs', (req, res) => res.render('pages/data/blogs'));

// World pages
app.get('/world/nys', (req, res) => res.render('pages/world/nys'));
app.get('/world/usa', (req, res) => res.render('pages/world/usa'));
app.get('/world/disease', (req, res) => res.render('pages/world/disease'));
app.get('/world/arcgis', (req, res) => res.render('pages/world/arcgis'));
app.get('/world/closings', (req, res) => res.render('pages/world/closings'));

// Fun pages
app.get('/fun/anime', (req, res) => res.render('pages/fun/anime'));
app.get('/fun/jokes', (req, res) => res.render('pages/fun/jokes'));
app.get('/fun/facts', (req, res) => res.render('pages/fun/facts'));
app.get('/fun/trivia', (req, res) => res.render('pages/fun/trivia'));

// Social pages  
app.get('/social/reddit', (req, res) => res.render('pages/social/reddit'));
app.get('/social/github', (req, res) => res.render('pages/social/github'));
app.get('/social/blogs', (req, res) => res.render('pages/social/blogs'));

// Tool pages
app.get('/tools/markdown', (req, res) => res.render('pages/tools/markdown'));
app.get('/tools/cron', (req, res) => res.render('pages/tools/cron'));
app.get('/tools/regex', (req, res) => res.render('pages/tools/regex'));
app.get('/tools/diff', (req, res) => res.render('pages/tools/diff'));
app.get('/tools/dictionary', (req, res) => res.render('pages/tools/dictionary'));

// Personal frontend pages
app.get('/personal/todos', (req, res) => res.render('pages/personal/todos'));
app.get('/personal/notes', (req, res) => res.render('pages/personal/notes'));
app.get('/personal/profile', (req, res) => res.render('pages/personal/profile'));

// Service frontend pages
app.get('/services/url', (req, res) => res.render('pages/services/url'));
app.get('/auth', (req, res) => res.render('pages/services/auth'));

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 2000;
const hostname = process.env.HOSTNAME;

app.listen(port, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.warn('⚠️  Starting without database connection');
  }
  console.log(`🚀 Server started: http://${hostname}:${port}`);
});
