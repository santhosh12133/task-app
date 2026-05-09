const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: !env.isProduction,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected');
}

module.exports = { connectDatabase };
