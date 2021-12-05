const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const cors = require('cors');
const checkAuth = require('../middleware/checkAuth');
const User = require('../models/user');

const authRoute = express.Router();
const cache = null;
const lastCacheTime = null;

authRoute.get('/me', cors(), checkAuth, async (req, res, next) => {
  const user = await User.findOne({ email: req.user });
  console.log(user);
  try {
    return res.json({
      errors: [],
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (err) {
    res.json({ error: error.message });
  }
});

authRoute.get('/*', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Message: `The current api endpoint is ${req.protocol}://${req.headers.host}/api/v1/auth`,
        info: `${req.protocol}://${req.headers.host}/api/v1/auth/me`,
        login: `${req.protocol}://${req.headers.host}/api/v1/auth/login`,
        login_body: '{ "email": "yourEmail", "password": "yourPassword" }',
        signup: `${req.protocol}://${req.headers.host}/api/v1/auth/signup`,
        signup_body:
          '{ "name": "yourName", "email": "yourEmail", "password": "yourPassword" }',
      })
    );
  } catch (err) {
    res.json({ error: err.message });
  }
});

authRoute.post(
  '/signup',
  cors(),
  body('email').isEmail().withMessage('The email is invalid'),
  body('password').isLength({ min: 5 }).withMessage('The password is invalid'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => {
        return {
          msg: error.msg,
        };
      });
      return res.json({ errors, data: null });
    }

    const { email, password, name } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        errors: [
          {
            msg: 'Email already in use',
          },
        ],
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = await JWT.sign(
      { email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: 360000,
      }
    );

    res.json({
      errors: [],
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
        },
      },
    });
  }
);

authRoute.post('/login', cors(), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      errors: [
        {
          msg: 'Invalids credentials',
        },
      ],
      data: null,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({
      errors: [
        {
          msg: 'Invalids credentials',
        },
      ],
      data: null,
    });
  }

  const token = await JWT.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: 360000,
  });

  return res.json({
    errors: [],
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
});

module.exports = authRoute;
