const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not yet valid' });
    }
    console.error('JWT verification failed:', { name: err.name, message: err.message });
    res.status(401).json({ message: 'Token is not valid' });
  }
};
