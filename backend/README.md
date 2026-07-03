# Blackcoffer Dashboard — Backend API

Node.js + Express + MongoDB backend for the Blackcoffer Data Visualization Dashboard.

## Prerequisites

- **Node.js** (v18+ LTS)
- **MongoDB** running locally (default: `mongodb://localhost:27017`) or a MongoDB Atlas connection string

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
#    Edit .env if needed (defaults work for local MongoDB)
#    PORT=5000
#    MONGODB_URI=mongodb://localhost:27017/blackcoffer_dashboard
#    CORS_ORIGIN=http://localhost:5173

# 3. Seed the database (inserts jsondata.json into MongoDB)
npm run seed

#    To clear existing data first:
npm run seed:fresh

# 4. Start dev server (with hot reload via nodemon)
npm run dev

#    Or start in production mode:
npm start
```

## API Endpoints

### `GET /api/health`
Health check.
```json
{ "status": "ok", "db": "connected" }
```

### `GET /api/insights`
Paginated, filtered, sorted list of insights.

**Query params**: `page` (default 1), `limit` (default 25), `sortBy`, `sortOrder` (asc/desc), `search` (text search), `endYear`, `endYearMin`, `endYearMax`, `startYear`, `startYearMin`, `startYearMax`, `topic`, `sector`, `region`, `pestle`, `source`, `country`, `city`, `swot` (alias for sector/pestle combination)

**Response**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 25, "totalRecords": 344, "totalPages": 14 }
}
```

### `GET /api/insights/filters`
Distinct values for filter dropdowns.
```json
{
  "success": true,
  "data": {
    "endYears": [2017, 2018, ...],
    "topics": ["gas", "oil", ...],
    "sectors": ["Energy", "Technology", ...],
    "regions": ["Northern America", "World", ...],
    "pestles": ["Industries", "Economic", ...],
    "sources": ["EIA", "OPEC", ...],
    "countries": ["United States of America", ...],
    "cities": []
  }
}
```

### `GET /api/insights/stats`
Aggregated KPI data. Supports same filter params as `/api/insights`.
```json
{
  "success": true,
  "data": {
    "totalRecords": 344,
    "avgIntensity": 5.8,
    "avgLikelihood": 3.2,
    "avgRelevance": 3.1,
    "topSector": "Energy",
    "countBySector": [{ "_id": "Energy", "count": 120, "avgIntensity": 6.2, ... }],
    "countByRegion": [...],
    "countByTopic": [...],
    "countByPestle": [...],
    "countByCountry": [...]
  }
}
```

### `GET /api/insights/:id`
Single record by MongoDB `_id`.

## Connecting to Frontend

Replace the mock data service in your frontend (`services/api.js`) with real fetch calls to `http://localhost:5000/api/insights` using the same filter parameter names the frontend already uses (`topics`, `sectors`, `regions`, `pestle`, `countries`, `source`, `swot`, `city`, `endYear`).
