const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const { env, isOriginAllowed } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { sanitizeRequest } = require('./middleware/validate');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const noteRoutes = require('./routes/notes');
const dashboardRoutes = require('./routes/dashboard');

function createApp() {
  const app = express();
  const clientBuildPath = path.join(__dirname, 'client', 'dist');
  const legacyPublicPath = path.join(__dirname, 'public');

  const defaultLimiterConfig = {
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
  };

  const apiLimiter = rateLimit({
    ...defaultLimiterConfig,
    windowMs: 60 * 1000,
    max: env.isProduction ? 300 : 2000,
    skip: (req) => req.path === '/api/health',
  });

  const authLimiter = rateLimit({
    ...defaultLimiterConfig,
    windowMs: 15 * 60 * 1000,
    max: env.isProduction ? 20 : 500,
    message: { message: 'Too many authentication attempts. Please try again later.' },
  });

  const aiLimiter = rateLimit({
    ...defaultLimiterConfig,
    windowMs: 15 * 60 * 1000,
    max: env.isProduction ? 60 : 600,
    message: { message: 'AI request limit reached. Please slow down and try again shortly.' },
  });

  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    cors({
      origin: isOriginAllowed(req.get('origin'), req.get('host')),
      credentials: true,
    })(req, res, next);
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(morgan(env.isTest ? 'tiny' : 'dev'));
  app.use(sanitizeRequest);
  app.use(apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'task-app',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/ai', aiLimiter, aiRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get(/.*/, (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }

      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else if (fs.existsSync(legacyPublicPath)) {
    app.use(express.static(legacyPublicPath));
    app.get(/.*/, (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }

      res.sendFile(path.join(legacyPublicPath, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
