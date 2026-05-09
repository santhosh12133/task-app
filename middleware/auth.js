const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication token is invalid or expired' });
    }

    next(error);
  }
}

module.exports = { requireAuth };
