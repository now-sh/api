require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();
app.set('view engine', 'ejs');

const middlewares = require('./middleware/errorHandler');
const handlers = require('./middleware/defaultHandler');

const startdb = require('./controllers/mongodb');
startdb();

app.use(handlers.handlerRoute);

app.use('/', require('./routes/defaultRoute'));
app.use('/api', require('./routes/apiRoute'));
app.use('/api/health', require('./routes/healthRoute'));
app.use('/api/v1/auth', require('./routes/authRoute'));
app.use('/api/v1/disease', require('./routes/diseaseRoute'));
app.use('/api/v1/arcgis', require('./routes/arcgisRoute'));
app.use('/api/v1/global', require('./routes/covidRoute'));
app.use('/api/v1/usa', require('./routes/usaRoute'));
app.use('/api/v1/nys', require('./routes/nysRoute'));
app.use('/api/v1/closings', require('./routes/closingsRoute'));
app.use('/api/v1/git', require('./routes/githubRoute'));
app.use('/api/v1/reddit', require('./routes/redditRoute'));
app.use('/api/v1/traffic', require('./routes/TrafficRoutes'));
app.use('/api/v1/profile', require('./routes/profileRoute'));
app.use('/api/v1/blogs', require('./routes/blogRoute'));

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 2000;
const hostname = process.env.HOSTNAME;

app.listen(port, () =>
  console.log(`Starting server: http://${hostname}:${port}`)
);
