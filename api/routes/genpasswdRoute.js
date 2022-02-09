const express = require('express');
const genpasswdRoute = express.Router();
let totalPasswordsGenerated = 0;

const generatePassword = (length) => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=<>,./?|[]{};:`~';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

genpasswdRoute.post('/', (req, res) => {
  const length = req.body.length || 16;
  const current = new Date();
  const time = current.toLocaleTimeString('en-US');
  totalPasswordsGenerated++;
  res.json({
    title: 'Strong Password Generator::Generate',
    password: generatePassword(length),
    passwordLength: length,
    totalPasswordsGenerated: totalPasswordsGenerated,
    time: time,
  });
});

module.exports = genpasswdRoute;
