const express = require('express');
const genpasswdRoute = express.Router();

const title = 'Generate Passwords';
let totalPasswordsGenerated = 0;

const generatePassword = (length) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@%$';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

genpasswdRoute.get('/', (req, res) => {
  const length = 16;
  const current = new Date();
  const time = current.toLocaleTimeString('en-US');
  totalPasswordsGenerated++;
  res.json({
    title: title,
    password: generatePassword(length),
    Usage_Get: `curl -q -LSsf -X GET ${req.protocol}://${req.headers.host}/api/v1/passwd/10 | jq -r '.password'`,
    Usage_Post: `curl -q -LSsf -X POST ${req.protocol}://${req.headers.host}/api/v1/passwd`,
  });
});

genpasswdRoute.get('/:length', (req, res) => {
  const length = req.params.length || 16;
  const current = new Date();
  const time = current.toLocaleTimeString('en-US');
  totalPasswordsGenerated++;
  res.json({
    title: title,
    password: generatePassword(length),
    time: time,
    passwordLength: length,
    totalPasswordsGenerated: totalPasswordsGenerated,
  });
});

genpasswdRoute.post('/', (req, res) => {
  const length = req.body.length || 16;
  const current = new Date();
  const time = current.toLocaleTimeString('en-US');
  totalPasswordsGenerated++;
  res.json({
    title: title,
    password: generatePassword(length),
    time: time,
    passwordLength: length,
    totalPasswordsGenerated: totalPasswordsGenerated,
  });
});

module.exports = genpasswdRoute;
