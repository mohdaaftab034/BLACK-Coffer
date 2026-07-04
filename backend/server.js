const app = require('./src/app');
const config = require('./src/config/env');
const { connectDB, closeDB } = require('./src/config/db');

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(`Failed to connect to database: ${err.message}`);
    process.exit(1);
  }

  try {
    const server = app.listen(config.port, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
      if (config.corsOrigin) console.log(`CORS origin: ${config.corsOrigin}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error(`Unhandled startup error: ${err.message}`);
  process.exit(1);
});
