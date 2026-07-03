const asyncHandler = require('../middlewares/asyncHandler');
const insightService = require('../services/insight.service');

const getInsights = asyncHandler(async (req, res) => {
  const result = await insightService.getInsights(req.query);
  res.json({ success: true, ...result });
});

const getInsightById = asyncHandler(async (req, res) => {
  const data = await insightService.getInsightById(req.params.id);
  res.json({ success: true, data });
});

const getFilters = asyncHandler(async (_req, res) => {
  const data = await insightService.getFilters();
  res.json({ success: true, data });
});

const getStats = asyncHandler(async (req, res) => {
  const data = await insightService.getStats(req.query);
  res.json({ success: true, data });
});

const healthCheck = asyncHandler(async (_req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db: dbState });
});

module.exports = { getInsights, getInsightById, getFilters, getStats, healthCheck };
