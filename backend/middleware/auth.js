const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Verificar que el usuario es admin
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.rol !== 'pastor') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };

