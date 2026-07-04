const app = require('./src/app');
const config = require('./src/config/env');
const { connectDB, closeDB } = require('./src/config/db');

connectDB();

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(async () => {
    await closeDB();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
