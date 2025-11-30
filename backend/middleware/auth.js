// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  } else {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }
};

module.exports = { protect };