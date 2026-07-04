const mongoose = require('mongoose');
const config = require('./env');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectWithRetry(retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.mongodbUri);
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  console.error('All MongoDB connection attempts failed. Server will start without DB.');
}

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

async function connectDB() {
  await connectWithRetry();
}

async function closeDB() {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

module.exports = { connectDB, closeDB };
