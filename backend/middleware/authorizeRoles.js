// backend/middleware/authorizeRoles.js
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado: no tienes permisos para esta acción',
      });
    }
    next();
  };
};

module.exports = authorizeRoles;