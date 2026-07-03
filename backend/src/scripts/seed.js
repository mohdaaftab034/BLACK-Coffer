const path = require('path');
const mongoose = require('mongoose');
const config = require('../config/env');
const { connectDB, closeDB } = require('../config/db');
const Insight = require('../models/Insight.model');
const { parseDateString } = require('../utils/dateParser');

const DATA_PATH = path.resolve(__dirname, '../../jsondata.json');

function transformRecord(raw) {
  const endYear = raw.end_year !== undefined && raw.end_year !== '' ? Number(raw.end_year) : null;
  const startYear = raw.start_year !== undefined && raw.start_year !== '' ? Number(raw.start_year) : null;
  const impact = raw.impact && raw.impact !== '' ? raw.impact : null;
  const addedDate = parseDateString(raw.added);
  const publishedDate = parseDateString(raw.published);

  if (raw.end_year !== '' && raw.end_year !== undefined && isNaN(endYear)) {
    console.warn(`  [WARN] Invalid end_year value: "${raw.end_year}" — setting to null`);
  }
  if (raw.start_year !== '' && raw.start_year !== undefined && isNaN(startYear)) {
    console.warn(`  [WARN] Invalid start_year value: "${raw.start_year}" — setting to null`);
  }
  if (!addedDate && raw.added) {
    console.warn(`  [WARN] Could not parse added date: "${raw.added}"`);
  }
  if (!publishedDate && raw.published) {
    console.warn(`  [WARN] Could not parse published date: "${raw.published}"`);
  }

  return {
    end_year: endYear,
    intensity: Number(raw.intensity) || 0,
    sector: raw.sector || '',
    topic: raw.topic || '',
    insight: raw.insight || '',
    url: raw.url || '',
    region: raw.region || '',
    start_year: startYear,
    impact,
    added: addedDate || null,
    published: publishedDate || null,
    country: raw.country || '',
    relevance: Number(raw.relevance) || 0,
    pestle: raw.pestle || '',
    source: raw.source || '',
    title: raw.title || '',
    likelihood: Number(raw.likelihood) || 0,
    city: raw.city || null,
  };
}

async function seed() {
  console.log('=== SEED SCRIPT START ===');
  console.log(`Node env: ${config.nodeEnv}`);
  console.log(`MongoDB URI: ${config.mongodbUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`Data path: ${DATA_PATH}`);

  const args = process.argv.slice(2);
  const isFresh = args.includes('--fresh');

  console.log('Step 1: Reading jsondata.json...');
  let rawArray;
  try {
    rawArray = require(DATA_PATH);
  } catch (err) {
    console.error(`FAILED: Could not read data file at ${DATA_PATH}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(rawArray)) {
    console.error(`FAILED: Data file must contain a JSON array, got ${typeof rawArray}`);
    process.exit(1);
  }

  console.log(`Step 2: Read ${rawArray.length} records from data file`);
  if (rawArray.length === 0) {
    console.error('FAILED: Data file contains an empty array — nothing to seed');
    process.exit(1);
  }

  console.log('Step 3: Connecting to MongoDB...');
  await connectDB();
  console.log('Step 4: MongoDB connection established');

  if (isFresh) {
    console.log('Step 4a: --fresh flag detected — clearing existing collection...');
    const deleteResult = await Insight.deleteMany({});
    console.log(`  Deleted ${deleteResult.deletedCount} existing records`);
  }

  console.log('Step 5: Transforming records...');
  let transformed;
  try {
    transformed = rawArray.map(transformRecord);
    console.log(`  Transformed ${transformed.length} records`);
  } catch (err) {
    console.error(`FAILED during transform: ${err.message}`);
    await closeDB();
    process.exit(1);
  }

  console.log('Step 6: Inserting into MongoDB...');
  try {
    const result = await Insight.insertMany(transformed, { ordered: false });
    console.log(`SUCCESS: Inserted ${result.length}/${rawArray.length} records`);
  } catch (err) {
    if (err.writeErrors) {
      const inserted = err.insertedDocs ? err.insertedDocs.length : 0;
      console.log(`PARTIAL: Inserted ${inserted}/${rawArray.length} (${err.writeErrors.length} errors)`);
      err.writeErrors.slice(0, 3).forEach((e) => {
        console.error(`  Write error: ${e.errmsg || e.message}`);
      });
    } else if (err.name === 'ValidationError') {
      console.error(`FAILED: Schema validation error:`);
      const messages = Object.values(err.errors).map((e) => `  ${e.path}: ${e.message}`);
      messages.slice(0, 5).forEach((m) => console.error(m));
    } else if (err.name === 'MongooseError' && err.message.includes('buffering')) {
      console.error('FAILED: Mongoose still buffering — DB connection may not be ready yet.');
      console.error('  Make sure connectDB() awaited before insertMany().');
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error(`FAILED: Cannot reach MongoDB at the configured URI.`);
      console.error(`  Check MONGODB_URI in .env and ensure MongoDB is running.`);
    } else {
      console.error(`FAILED: ${err.message}`);
      console.error(`  Full error:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    }
    await closeDB();
    process.exit(1);
  }

  console.log('Step 7: Verifying...');
  try {
    const count = await Insight.countDocuments();
    console.log(`  Collection "insights" now has ${count} documents`);
  } catch (err) {
    console.warn(`  Could not verify count: ${err.message}`);
  }

  await closeDB();
  console.log('=== SEED COMPLETE ===');
}

seed();
