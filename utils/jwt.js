const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || 'member',
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = {
  createAccessToken,
  verifyAccessToken,
};
