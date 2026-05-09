function parseOrigins(value) {
  const configured = String(value || 'http://localhost:5173')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return [...new Set([...configured, 'http://localhost:5000', 'http://127.0.0.1:5000', 'http://127.0.0.1:5173'])];
}

const nodeEnv = ['production', 'test'].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-app',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  authCookieName: 'orion_token',
};

function assertProductionEnvironment() {
  if (!env.isProduction) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in production');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret') {
    throw new Error('A strong JWT_SECRET must be set in production');
  }
}

function isOriginAllowed(origin, host) {
  if (!origin) {
    return true;
  }

  // Keep local development friction-free across tools using random localhost ports.
  if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }

  const sameOriginCandidates = host ? [`http://${host}`, `https://${host}`] : [];
  return env.clientOrigins.includes(origin) || sameOriginCandidates.includes(origin);
}

module.exports = {
  env,
  assertProductionEnvironment,
  isOriginAllowed,
  parseOrigins,
};
