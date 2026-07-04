const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcoffer',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
});

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not set, using default localhost. Set it in .env or environment variables.');
}

module.exports = config;
