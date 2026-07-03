const Insight = require('../models/Insight.model');

function buildFilterQuery(queryParams) {
  const filter = {};

  const {
    endYear, endYearMin, endYearMax,
    startYear, startYearMin, startYearMax,
    topic, sector, region, pestle, source, country, city,
    swot, search,
  } = queryParams;

  if (endYear !== undefined) {
    const val = parseInt(endYear, 10);
    if (!isNaN(val)) filter.end_year = val;
  } else {
    if (endYearMin !== undefined || endYearMax !== undefined) {
      filter.end_year = {};
      if (endYearMin !== undefined) {
        const val = parseInt(endYearMin, 10);
        if (!isNaN(val)) filter.end_year.$gte = val;
      }
      if (endYearMax !== undefined) {
        const val = parseInt(endYearMax, 10);
        if (!isNaN(val)) filter.end_year.$lte = val;
      }
    }
  }

  if (startYear !== undefined) {
    const val = parseInt(startYear, 10);
    if (!isNaN(val)) filter.start_year = val;
  } else {
    if (startYearMin !== undefined || startYearMax !== undefined) {
      filter.start_year = {};
      if (startYearMin !== undefined) {
        const val = parseInt(startYearMin, 10);
        if (!isNaN(val)) filter.start_year.$gte = val;
      }
      if (startYearMax !== undefined) {
        const val = parseInt(startYearMax, 10);
        if (!isNaN(val)) filter.start_year.$lte = val;
      }
    }
  }

  if (topic) filter.topic = { $in: topic.split(',').map((s) => s.trim()).filter(Boolean) };
  if (sector) filter.sector = { $in: sector.split(',').map((s) => s.trim()).filter(Boolean) };
  if (region) filter.region = { $in: region.split(',').map((s) => s.trim()).filter(Boolean) };
  if (pestle) filter.pestle = { $in: pestle.split(',').map((s) => s.trim()).filter(Boolean) };
  if (source) filter.source = { $in: source.split(',').map((s) => s.trim()).filter(Boolean) };
  if (country) filter.country = { $in: country.split(',').map((s) => s.trim()).filter(Boolean) };
  if (city) filter.city = { $in: city.split(',').map((s) => s.trim()).filter(Boolean) };

  /*
   * SWOT filter: The raw dataset has no explicit SWOT field.
   * In this context, SWOT values are mapped against `sector` and `pestle`
   * fields using an $or query so that selecting e.g. "Strengths" matches
   * records where the sector OR pestle contains that value.
   */
  if (swot) {
    const swotValues = swot.split(',').map((s) => s.trim()).filter(Boolean);
    if (swotValues.length) {
      filter.$or = [
        { sector: { $in: swotValues } },
        { pestle: { $in: swotValues } },
      ];
    }
  }

  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
}

function buildSortOption(sortBy, sortOrder) {
  const order = sortOrder === 'desc' ? -1 : 1;
  const allowedFields = [
    'intensity', 'likelihood', 'relevance', 'end_year', 'start_year',
    'added', 'published', 'sector', 'topic', 'region', 'country', 'pestle', 'source',
  ];
  if (sortBy && allowedFields.includes(sortBy)) {
    return { [sortBy]: order };
  }
  return { added: -1 };
}

async function getInsights(queryParams) {
  const filter = buildFilterQuery(queryParams);
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 25;
  const skip = (page - 1) * limit;
  const sort = buildSortOption(queryParams.sortBy, queryParams.sortOrder);

  const [data, totalRecords] = await Promise.all([
    Insight.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Insight.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
}

async function getInsightById(id) {
  const doc = await Insight.findById(id).lean();
  if (!doc) {
    const err = new Error(`Insight not found with id: ${id}`);
    err.statusCode = 404;
    throw err;
  }
  return doc;
}

async function getFilters() {
  const fields = ['end_year', 'topic', 'sector', 'region', 'pestle', 'source', 'country', 'city'];
  const pipeline = fields.map((field) => [
    { $group: { _id: `$${field}` } },
    { $match: { _id: { $ne: null, $ne: '' } } },
    { $sort: { _id: 1 } },
    { $project: { value: '$_id', _id: 0 } },
  ]);

  const results = await Promise.all(
    pipeline.map((pipe) => Insight.aggregate(pipe))
  );

  const [endYears, topics, sectors, regions, pestles, sources, countries, cities] = results;

  const clean = (arr) => arr.map((r) => r.value).filter((v) => v !== null && v !== undefined && v !== '');

  return {
    endYears: clean(endYears),
    topics: clean(topics),
    sectors: clean(sectors),
    regions: clean(regions),
    pestle: clean(pestles),
    source: clean(sources),
    countries: clean(countries),
    cities: clean(cities),
  };
}

async function getStats(queryParams) {
  const filter = buildFilterQuery(queryParams);

  const matchStage = { $match: filter };

  const [overallStats, countBySector, countByRegion, countByTopic, countByPestle, countByCountry] =
    await Promise.all([
      Insight.aggregate([
        matchStage,
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            avgIntensity: { $avg: '$intensity' },
            avgLikelihood: { $avg: '$likelihood' },
            avgRelevance: { $avg: '$relevance' },
          },
        },
      ]),
      Insight.aggregate([
        matchStage,
        {
          $group: {
            _id: '$sector',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity' },
            avgLikelihood: { $avg: '$likelihood' },
            avgRelevance: { $avg: '$relevance' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Insight.aggregate([
        matchStage,
        {
          $group: {
            _id: '$region',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity' },
            avgLikelihood: { $avg: '$likelihood' },
            avgRelevance: { $avg: '$relevance' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Insight.aggregate([
        matchStage,
        {
          $group: {
            _id: '$topic',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity' },
            avgLikelihood: { $avg: '$likelihood' },
            avgRelevance: { $avg: '$relevance' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Insight.aggregate([
        matchStage,
        {
          $group: {
            _id: '$pestle',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity' },
            avgLikelihood: { $avg: '$likelihood' },
            avgRelevance: { $avg: '$relevance' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Insight.aggregate([
        matchStage,
        {
          $group: {
            _id: '$country',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$intensity' },
            avgLikelihood: { $avg: '$likelihood' },
            avgRelevance: { $avg: '$relevance' },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

  const overall = overallStats[0] || {
    totalRecords: 0,
    avgIntensity: 0,
    avgLikelihood: 0,
    avgRelevance: 0,
  };

  const topSector = countBySector.length > 0 ? countBySector[0]._id : null;

  return {
    totalRecords: overall.totalRecords,
    avgIntensity: Math.round(overall.avgIntensity * 100) / 100,
    avgLikelihood: Math.round(overall.avgLikelihood * 100) / 100,
    avgRelevance: Math.round(overall.avgRelevance * 100) / 100,
    topSector,
    countBySector,
    countByRegion,
    countByTopic,
    countByPestle,
    countByCountry,
  };
}

module.exports = { getInsights, getInsightById, getFilters, getStats };
