const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const insightRoutes = require('./routes/insight.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
const corsOptions = config.isProduction
  ? { origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map(s => s.trim()) }
  : { origin: config.corsOrigin };
app.use(cors(corsOptions));
app.use(express.json());

if (!config.isProduction) {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db: dbState });
});

app.use('/api/insights', insightRoutes);

if (config.isProduction) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
