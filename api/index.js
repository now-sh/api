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

const startdb = require('./controllers/mongodb');

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

// Main routes
app.use('/', require('./routes/mainRoute'));
app.use('/api', require('./routes/apiRoute'));
app.use('/api/docs', require('./routes/docsRoute'));

// Health check alias at root
app.get('/healthz', (req, res) => res.redirect('/api/health/healthz'));

// ==== NEW CATEGORIZED ROUTES (PREFERRED) ====

// 🔧 Utilities - Encoding, Conversion, Generation
app.use('/api/v1/utilities/base64', require('./routes/base64Route'));
app.use('/api/v1/utilities/hash', require('./routes/hashRoute'));
app.use('/api/v1/utilities/uuid', require('./routes/uuidRoute'));
app.use('/api/v1/utilities/jwt', require('./routes/jwtRoute'));
app.use('/api/v1/utilities/qr', require('./routes/qrRoute'));
app.use('/api/v1/utilities/color', require('./routes/colorRoute'));
app.use('/api/v1/utilities/lorem', require('./routes/loremIpsum'));
app.use('/api/v1/utilities/passwd', require('./routes/genpasswdRoute'));

// 🛠️ Tools - Development & Productivity
app.use('/api/v1/tools/commit', require('./routes/commitRoute'));

// 📊 Data - External Data Sources
app.use('/api/v1/data/domains', require('./routes/domainRoute'));
app.use('/api/v1/data/timezones', require('./routes/timezoneRoute'));
app.use('/api/v1/data/closings', require('./routes/closingsRoute'));
app.use('/api/v1/data/git', require('./routes/githubRoute'));
app.use('/api/v1/data/reddit', require('./routes/redditRoute'));
app.use('/api/v1/data/blogs', require('./routes/blogRoute'));
app.use('/api/v1/data/anime', require('./routes/animeRoute'));

// 🏥 Health - Health & Location Services
app.use('/api/v1/health/global', require('./routes/covidRoute'));
app.use('/api/v1/health/arcgis', require('./routes/arcgisRoute'));
app.use('/api/v1/health/usa', require('./routes/usaRoute'));
app.use('/api/v1/health/nys', require('./routes/nysRoute'));
app.use('/api/v1/health/disease', require('./routes/diseaseRoute'));
app.use('/api/v1/health/closings', require('./routes/closingsRoute'));
app.use('/api/v1/health/traffic', require('./routes/TrafficRoutes'));

// 👤 Personal - User Data Management  
app.use('/api/v1/personal/todos', require('./routes/todoRoute'));
app.use('/api/v1/personal/notes', require('./routes/notesRoute'));
app.use('/api/v1/personal/profile', require('./routes/profileRoute'));

// 🌐 Services - System & Utility Services
app.use('/api/v1/services/timezones', require('./routes/timezoneRoute'));
app.use('/api/v1/services/url', require('./routes/urlRoute'));
app.use('/api/health', require('./routes/healthRoute')); // Keep unversioned

// Add healthz at v1 level
const healthRoute = require('./routes/healthRoute');
app.use('/api/v1', (req, res, next) => {
  if (req.path === '/healthz') {
    req.url = '/healthz';
    healthRoute(req, res, next);
  } else {
    next();
  }
});

// 🔐 Authentication Services
app.use('/api/v1/auth', require('./routes/authRoute'));

// ==== LEGACY ROUTES (BACKWARD COMPATIBILITY) ====
// These routes maintain backward compatibility with existing clients

// Legacy utility routes
app.use('/api/v1/base64', require('./routes/base64Route'));
app.use('/api/v1/hash', require('./routes/hashRoute'));
app.use('/api/v1/uuid', require('./routes/uuidRoute'));
app.use('/api/v1/jwt', require('./routes/jwtRoute'));
app.use('/api/v1/qr', require('./routes/qrRoute'));
app.use('/api/v1/color', require('./routes/colorRoute'));
app.use('/api/v1/lorem', require('./routes/loremIpsum'));
app.use('/api/v1/passwd', require('./routes/genpasswdRoute'));

// Legacy tool routes
app.use('/api/v1/commit', require('./routes/commitRoute'));

// Legacy data routes
app.use('/api/v1/domains', require('./routes/domainRoute'));
app.use('/api/v1/git', require('./routes/githubRoute'));
app.use('/api/v1/reddit', require('./routes/redditRoute'));
app.use('/api/v1/blogs', require('./routes/blogRoute'));
app.use('/api/v1/anime', require('./routes/animeRoute'));

// Legacy health routes
app.use('/api/v1/global', require('./routes/covidRoute'));
app.use('/api/v1/arcgis', require('./routes/arcgisRoute'));
app.use('/api/v1/usa', require('./routes/usaRoute'));
app.use('/api/v1/nys', require('./routes/nysRoute'));
app.use('/api/v1/disease', require('./routes/diseaseRoute'));
app.use('/api/v1/closings', require('./routes/closingsRoute'));
app.use('/api/v1/traffic', require('./routes/TrafficRoutes'));

// Legacy personal routes
app.use('/api/v1/auth', require('./routes/authRoute'));
app.use('/api/v1/todos', require('./routes/todoRoute'));
app.use('/api/v1/notes', require('./routes/notesRoute'));
app.use('/api/v1/profile', require('./routes/profileRoute'));
app.use('/api/v1/url', require('./routes/urlRoute'));

// Legacy service routes
app.use('/api/v1/timezones', require('./routes/timezoneRoute'));

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
app.get('/data/covid', (req, res) => res.render('pages/data/covid'));
app.get('/data/anime', (req, res) => res.render('pages/data/anime'));
app.get('/data/domains', (req, res) => res.render('pages/data/domains'));
app.get('/data/timezones', (req, res) => res.render('pages/data/timezones'));
app.get('/data/closings', (req, res) => res.render('pages/data/closings'));
app.get('/data/blogs', (req, res) => res.render('pages/data/blogs'));

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
  await startdb();
  console.log(`🚀 Server started: http://${hostname}:${port}`);
});
