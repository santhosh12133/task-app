const { env } = require('../config/env');

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: env.isProduction ? 'strict' : 'lax',
    secure: env.isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(env.authCookieName, token, getCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(env.authCookieName, {
    ...getCookieOptions(),
    maxAge: undefined,
  });
}

module.exports = {
  clearAuthCookie,
  setAuthCookie,
};
