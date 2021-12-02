require('dotenv').config();
const path = require('path');
const express = require('express');
const handlerRoute = express.Router();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const morganHandler = handlerRoute.use(morgan('common'));
const helmetHandler = handlerRoute.use(helmet());
const expressHandler = handlerRoute.use(
  express.static(path.join(__dirname, '../public')),
  express.urlencoded({
    extended: true,
  }),
  cors()
);

module.exports = { expressHandler, morganHandler, helmetHandler, handlerRoute };
