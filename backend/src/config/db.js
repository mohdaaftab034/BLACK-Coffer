const mongoose = require('mongoose');
const config = require('./env');

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongodbUri).then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error(`MongoDB connection failed: ${err.message}`);
  }

  return cached.conn;
}

async function closeDB() {
  if (cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = { connectDB, closeDB };
