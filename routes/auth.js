const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const { env } = require('../config/env');
const { requireAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { recordActivity } = require('../utils/activity');
const { clearAuthCookie, setAuthCookie } = require('../utils/authCookies');
const { createAccessToken } = require('../utils/jwt');
const { authSchemas } = require('../validation/schemas');

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    theme: user.theme,
    role: user.role,
    streak: user.streak,
    xp: user.xp,
    preferences: user.preferences,
    bio: user.bio,
  };
}

function issueAuthResponse(res, user) {
  const token = createAccessToken(user);
  setAuthCookie(res, token);
  return { token, user: sanitizeUser(user) };
}

router.post('/signup', validateRequest({ body: authSchemas.signup }), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    await recordActivity({ userId: user._id, type: 'auth', title: 'Created account' });
    res.status(201).json(issueAuthResponse(res, user));
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateRequest({ body: authSchemas.login }), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    await recordActivity({ userId: user._id, type: 'auth', title: 'Logged in' });
    res.json(issueAuthResponse(res, user));
  } catch (error) {
    next(error);
  }
});

router.post('/google', validateRequest({ body: authSchemas.google }), async (req, res, next) => {
  try {
    const { idToken, name, email, picture } = req.body;
    let profile = { name, email, picture };
    if (idToken && env.googleClientId) {
      const client = new OAuth2Client(env.googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.googleClientId,
      });
      const payload = ticket.getPayload();
      profile = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
    } else if (idToken && env.isProduction) {
      return res.status(400).json({ message: 'Google login is not configured correctly' });
    }

    if (!profile.email) {
      return res.status(400).json({ message: 'Google login failed' });
    }

    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: profile.name || 'Google User',
        email: profile.email.toLowerCase(),
        avatarUrl: profile.picture || '',
        googleId: idToken ? crypto.createHash('sha256').update(idToken).digest('hex') : `google-${Date.now()}`,
      });
    } else if (!user.avatarUrl && profile.picture) {
      user.avatarUrl = profile.picture;
      await user.save();
    }

    await recordActivity({ userId: user._id, type: 'auth', title: 'Signed in with Google' });
    res.json(issueAuthResponse(res, user));
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validateRequest({ body: authSchemas.forgotPassword }), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If the account exists, a reset link was generated' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });

    res.json({
      message: 'If the account exists, a reset link was generated',
      resetToken: env.isProduction ? undefined : resetToken,
      resetUrl: env.isProduction ? undefined : `${env.clientOrigins[0]}/reset-password?token=${resetToken}`,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validateRequest({ body: authSchemas.resetPassword }), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordResetToken.findOne({ tokenHash });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    await PasswordResetToken.deleteMany({ userId: user._id });
    await recordActivity({ userId: user._id, type: 'auth', title: 'Reset password' });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.put('/me', requireAuth, validateRequest({ body: authSchemas.updateProfile }), async (req, res, next) => {
  try {
    const { name, bio, theme, preferences, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (theme !== undefined) user.theme = theme;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    await recordActivity({ userId: user._id, type: 'profile', title: 'Updated profile' });
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
