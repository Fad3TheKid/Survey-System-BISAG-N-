const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authorization header missing or malformed');
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to authorize based on roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  authorizeRoles,
};
