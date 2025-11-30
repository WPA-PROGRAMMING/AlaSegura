// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'alasegura-secret-key', {
    expiresIn: '7d',
  });
};

module.exports = generateToken;