const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    end_year: {
      type: Number,
      default: null,
      index: true,
    },
    intensity: {
      type: Number,
      required: true,
    },
    sector: {
      type: String,
      default: '',
      index: true,
    },
    topic: {
      type: String,
      default: '',
      index: true,
    },
    insight: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    region: {
      type: String,
      default: '',
      index: true,
    },
    start_year: {
      type: Number,
      default: null,
    },
    impact: {
      type: String,
      default: null,
    },
    added: {
      type: Date,
      default: null,
    },
    published: {
      type: Date,
      default: null,
    },
    country: {
      type: String,
      default: '',
      index: true,
    },
    relevance: {
      type: Number,
      required: true,
    },
    pestle: {
      type: String,
      default: '',
      index: true,
    },
    source: {
      type: String,
      default: '',
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    likelihood: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

insightSchema.index({ title: 'text', insight: 'text' });

module.exports = mongoose.model('Insight', insightSchema);
