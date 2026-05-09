require('dotenv').config();

const http = require('http');

const { createApp } = require('./app');
const { connectDatabase } = require('./config/database');
const { assertProductionEnvironment, env } = require('./config/env');
const { initSocket } = require('./utils/socket');

async function start() {
  assertProductionEnvironment();
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`Server started on port ${env.port}`);
  });

  return server;
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = {
  start,
};
