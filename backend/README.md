# Blackcoffer Dashboard — Backend API

> Express 4 + Mongoose 8 REST API for the Blackcoffer Data Visualization Dashboard. Provides filtered, paginated, and aggregated access to intelligence insights data.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [API Endpoints](#api-endpoints)
  - [GET /](#get-)
  - [GET /api/health](#get-apihealth)
  - [GET /api/insights](#get-apiinsights)
  - [GET /api/insights/filters](#get-apiinsightsfilters)
  - [GET /api/insights/stats](#get-apiinsightsstats)
  - [GET /api/insights/:id](#get-apiinsightsid)
- [Database Schema](#database-schema)
- [Architecture](#architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Seed Script](#seed-script)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Tech Stack

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `express` | ^4.21.0 | HTTP server & routing |
| `mongoose` | ^8.6.0 | MongoDB ODM |
| `helmet` | ^7.1.0 | Security headers |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `morgan` | ^1.10.0 | HTTP request logging |
| `dotenv` | ^16.4.5 | Environment variable loading |
| `express-rate-limit` | ^7.4.0 | Rate limiting |
| `nodemon` | ^3.1.4 (dev) | Auto-restart during development |

---

## Folder Structure

```
backend/
├── api/
│   └── index.js                 # Serverless entry point (Vercel)
├── src/
│   ├── config/
│   │   ├── db.js                # MongoDB connection (with serverless caching)
│   │   └── env.js               # Environment variable configuration
│   ├── controllers/
│   │   └── insight.controller.js # Route handler functions
│   ├── middlewares/
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validateQuery.js     # Query parameter validation
│   ├── models/
│   │   └── Insight.model.js     # Mongoose schema & model
│   ├── routes/
│   │   └── insight.routes.js    # Route definitions
│   ├── scripts/
│   │   └── seed.js              # Database seeding script
│   ├── services/
│   │   └── insight.service.js   # Business logic layer
│   └── utils/
│       └── dateParser.js        # Custom date string parser
├── app.js                       # Express application setup
├── server.js                    # Dev/prod server entry point
├── jsondata.json                # Source data file for seeding
├── .env                         # Environment variables (git-ignored)
├── .env.example                 # Environment variable template
├── vercel.json                  # Vercel serverless config
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Install

```bash
cd backend
npm install
```

### Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/blackcoffer_dashboard
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Seed the Database

```bash
npm run seed          # Insert data from jsondata.json
npm run seed:fresh    # Clear collection first, then insert
```

### Start Development

```bash
npm run dev     # nodemon — auto-restart on changes
```

Server starts at `http://localhost:4000`.

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `5000` | No | Server listen port |
| `MONGODB_URI` | `mongodb://localhost:27017/blackcoffer` | No | MongoDB connection string |
| `NODE_ENV` | `development` | No | Environment mode |
| `CORS_ORIGIN` | `http://localhost:5173` | No | Allowed CORS origin |

Values are frozen in `src/config/env.js` after loading.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon server.js` | Start with auto-restart on file changes |
| `start` | `node server.js` | Start in production mode |
| `seed` | `node src/scripts/seed.js` | Seed database from `jsondata.json` |
| `seed:fresh` | `node src/scripts/seed.js --fresh` | Clear + re-seed database |

---

## API Overview

**Base URL** (dev): `http://localhost:4000`

**Response Envelope** — All successful responses follow:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }   // only for paginated endpoints
}
```

**Error Responses** follow:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "stack": "..."   // only in development mode
}
```

---

## API Endpoints

---

### GET /

Returns basic API information.

**Authentication:** None

**Request Parameters:** None

**Request Body:** None

**Success Response (200):**

```json
{
  "name": "Blackcoffer Dashboard API",
  "version": "1.0.0"
}
```

**Error Responses:** N/A

**Status Codes:** `200 OK`

---

### GET /api/health

Health check endpoint that returns server status and database connection state.

**Authentication:** None

**Request Parameters:** None

**Request Body:** None

**Success Response (200):**

```json
{
  "status": "ok",
  "db": "connected"
}
```

If the database is disconnected:

```json
{
  "status": "ok",
  "db": "disconnected"
}
```

**Error Responses:** N/A

**Status Codes:** `200 OK`

---

### GET /api/insights

Paginated, filtered, and sorted list of insights.

**Authentication:** None

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (validated: must be ≥ 1) |
| `limit` | integer | `25` | Results per page (validated: must be ≥ 1) |
| `sortBy` | string | `added` | Field to sort by. Allowed values: `intensity`, `likelihood`, `relevance`, `end_year`, `start_year`, `added`, `published`, `sector`, `topic`, `region`, `country`, `pestle`, `source` |
| `sortOrder` | string | `desc` | Sort direction: `asc` or `desc` |
| `search` | string | — | Full-text search across `title` and `insight` fields |
| `endYear` | integer | — | Exact match on `end_year` |
| `endYearMin` | integer | — | Minimum `end_year` (gte) — ignored if `endYear` is set |
| `endYearMax` | integer | — | Maximum `end_year` (lte) — ignored if `endYear` is set |
| `startYear` | integer | — | Exact match on `start_year` |
| `startYearMin` | integer | — | Minimum `start_year` (gte) — ignored if `startYear` is set |
| `startYearMax` | integer | — | Maximum `start_year` (lte) — ignored if `startYear` is set |
| `topic` | string | — | Comma-separated list of topics (`$in`) |
| `sector` | string | — | Comma-separated list of sectors (`$in`) |
| `region` | string | — | Comma-separated list of regions (`$in`) |
| `pestle` | string | — | Comma-separated list of PESTLE categories (`$in`) |
| `source` | string | — | Comma-separated list of sources (`$in`) |
| `country` | string | — | Comma-separated list of countries (`$in`) |
| `city` | string | — | Comma-separated list of cities (`$in`) |
| `swot` | string | — | Comma-separated list of SWOT values. Matches against `sector` OR `pestle` via `$or` |

**Request Body:** None

**Example Request:**

```
GET /api/insights?page=1&limit=10&sector=Energy&sortBy=intensity&sortOrder=desc
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "end_year": 2020,
      "intensity": 8,
      "sector": "Energy",
      "topic": "Oil",
      "insight": "Global oil demand is expected to remain flat...",
      "url": "https://example.com/article",
      "region": "World",
      "start_year": 2018,
      "impact": "Medium",
      "added": "2023-01-15T14:30:00.000Z",
      "published": "2023-01-10T00:00:00.000Z",
      "country": "United States of America",
      "relevance": 5,
      "pestle": "Economic",
      "source": "EIA",
      "title": "Oil Demand Outlook",
      "likelihood": 4,
      "city": null,
      "createdAt": "2024-05-23T10:00:00.000Z",
      "updatedAt": "2024-05-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 45,
    "totalPages": 5
  }
}
```

**Error Responses:**

| Status Code | Condition | Example |
|-------------|-----------|---------|
| `400` | Invalid `page` or `limit` | `{ "success": false, "message": "Query parameter \"page\" must be a positive integer", "statusCode": 400 }` |
| `400` | Invalid `sortOrder` | `{ "success": false, "message": "Query parameter \"sortOrder\" must be \"asc\" or \"desc\"", "statusCode": 400 }` |
| `500` | Server error | `{ "success": false, "message": "Internal Server Error", "statusCode": 500 }` |

**Status Codes:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

---

### GET /api/insights/filters

Returns distinct values for all filterable fields to populate dropdown menus.

**Authentication:** None

**Request Parameters:** None

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "endYears": [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    "topics": ["gas", "oil", "renewable", "energy", "economy", "policy", "technology"],
    "sectors": ["Energy", "Technology", "Environment", "Agriculture", "Finance", "Healthcare"],
    "regions": ["Northern America", "World", "Europe", "Asia", "Africa", "Middle East"],
    "pestle": ["Economic", "Environmental", "Political", "Technological", "Social", "Legal"],
    "source": ["EIA", "OPEC", "Bloomberg", "Reuters", "IEA", "World Bank"],
    "countries": ["United States of America", "China", "India", "Germany", "Brazil"],
    "cities": []
  }
}
```

**Error Responses:**

| Status Code | Condition |
|-------------|-----------|
| `500` | Database query failure |

**Status Codes:** `200 OK`, `500 Internal Server Error`

**Implementation Detail:** Runs 8 parallel MongoDB aggregation pipelines — one per field — using `$group`, `$match` (null/empty filter), `$sort`, and `$project` stages.

---

### GET /api/insights/stats

Returns aggregated KPI data and breakdowns for the dashboard's KPI cards and chart components. Supports the same filter parameters as `/api/insights`.

**Authentication:** None

**Query Parameters:** Same filter parameters as [`GET /api/insights`](#get-apiinsights) — `endYear`, `endYearMin`, `endYearMax`, `topic`, `sector`, `region`, `pestle`, `source`, `country`, `city`, `swot`, `search`.

**Request Body:** None

**Example Request:**

```
GET /api/insights/stats?sector=Energy
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalRecords": 344,
    "avgIntensity": 5.83,
    "avgLikelihood": 3.21,
    "avgRelevance": 3.07,
    "topSector": "Energy",
    "countBySector": [
      { "_id": "Energy", "count": 120, "avgIntensity": 6.2, "avgLikelihood": 3.5, "avgRelevance": 3.8 },
      { "_id": "Technology", "count": 85, "avgIntensity": 4.8, "avgLikelihood": 2.9, "avgRelevance": 3.1 }
    ],
    "countByRegion": [
      { "_id": "Northern America", "count": 98, "avgIntensity": 5.9, "avgLikelihood": 3.3, "avgRelevance": 3.2 }
    ],
    "countByTopic": [
      { "_id": "Oil", "count": 65, "avgIntensity": 6.5, "avgLikelihood": 3.8, "avgRelevance": 4.1 }
    ],
    "countByPestle": [
      { "_id": "Economic", "count": 110, "avgIntensity": 5.5, "avgLikelihood": 3.4, "avgRelevance": 3.6 }
    ],
    "countByCountry": [
      { "_id": "United States of America", "count": 72, "avgIntensity": 6.1, "avgLikelihood": 3.5, "avgRelevance": 3.9 }
    ]
  }
}
```

**Error Responses:**

| Status Code | Condition |
|-------------|-----------|
| `500` | Database query failure |

**Status Codes:** `200 OK`, `500 Internal Server Error`

**Implementation Detail:** Runs 6 parallel MongoDB aggregation pipelines: one for overall stats (`$group` with `$sum` / `$avg`) and five for breakdowns by sector, region, topic, PESTLE, and country (each with `$group` + `$sort`). All pipelines apply the same `$match` stage from the query filters.

---

### GET /api/insights/:id

Returns a single insight record by its MongoDB `_id`.

**Authentication:** None

**Route Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId (24-character hex string) |

**Request Body:** None

**Example Request:**

```
GET /api/insights/664f1a2b3c4d5e6f7a8b9c0d
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "end_year": 2020,
    "intensity": 8,
    "sector": "Energy",
    "topic": "Oil",
    "insight": "Global oil demand is expected to remain flat...",
    "url": "https://example.com/article",
    "region": "World",
    "start_year": 2018,
    "impact": "Medium",
    "added": "2023-01-15T14:30:00.000Z",
    "published": "2023-01-10T00:00:00.000Z",
    "country": "United States of America",
    "relevance": 5,
    "pestle": "Economic",
    "source": "EIA",
    "title": "Oil Demand Outlook",
    "likelihood": 4,
    "city": null,
    "createdAt": "2024-05-23T10:00:00.000Z",
    "updatedAt": "2024-05-23T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status Code | Condition | Example |
|-------------|-----------|---------|
| `404` | Invalid or non-existent ID | `{ "success": false, "message": "Insight not found with id: 664f1a2b3c4d5e6f7a8b9c0d", "statusCode": 404 }` |
| `500` | Malformed ObjectId | `{ "success": false, "message": "Cast to ObjectId failed...", "statusCode": 500 }` |

**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

---

## Database Schema

### Collection: `insights`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `end_year` | Number | No | Yes | `null` | Target year of the insight |
| `intensity` | Number | **Yes** | No | — | Impact intensity score |
| `sector` | String | No | Yes | `''` | Industry sector |
| `topic` | String | No | Yes | `''` | Topic category |
| `insight` | String | No | No | `''` | Full insight text |
| `url` | String | No | No | `''` | Source URL |
| `region` | String | No | Yes | `''` | Geographic region |
| `start_year` | Number | No | No | `null` | Start year |
| `impact` | String | No | No | `null` | Impact level |
| `added` | Date | No | No | — | Date insight was added |
| `published` | Date | No | No | — | Publication date |
| `country` | String | No | Yes | `''` | Country |
| `relevance` | Number | **Yes** | No | — | Relevance score |
| `pestle` | String | No | Yes | `''` | PESTLE category |
| `source` | String | No | Yes | `''` | Data source name |
| `title` | String | No | Text | `''` | Insight title |
| `likelihood` | Number | **Yes** | No | — | Likelihood score |
| `city` | String | No | Yes | `null` | City |
| `createdAt` | Date | Auto | No | — | Mongoose timestamp |
| `updatedAt` | Date | Auto | No | — | Mongoose timestamp |

**Indexes:**

- Single-field indexes on: `end_year`, `sector`, `topic`, `region`, `country`, `pestle`, `source`, `city`
- Compound **text index** on `title` and `insight` for full-text search:

```javascript
db.insights.createIndex({ title: "text", insight: "text" })
```

---

## Architecture

The backend follows a **layered architecture** to separate concerns:

### Request Lifecycle

```
HTTP Request
  │
  ▼
┌──────────────────────────────────────────────────────┐
│                    Middleware Stack                    │
│  helmet() → cors() → express.json() → morgan()        │
│  → validateQuery() (for GET /api/insights)            │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    Routes                              │
│  insight.routes.js → maps URL paths to controllers    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Controllers                           │
│  insight.controller.js → extracts params, calls       │
│  service, sends JSON response                         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                   Services                             │
│  insight.service.js → business logic, query building, │
│  aggregation pipelines, pagination                    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    Models                              │
│  Insight.model.js → Mongoose schema & query methods    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
                   MongoDB
```

### Layers

1. **Middleware** — Security (Helmet), CORS, body parsing, logging (Morgan), query validation.
2. **Routes** — Thin mapping of URL patterns to controller methods.
3. **Controllers** — Lightweight handlers that extract request data and delegate to services.
4. **Services** — Core business logic: filter building, aggregation pipelines, pagination math.
5. **Models** — Mongoose schema definition and database interaction.

---

## Authentication & Authorization

**Currently not implemented.** The API is public and does not require authentication. All endpoints are accessible without credentials.

Future implementation could add:
- JWT-based authentication middleware
- Role-based access control
- API key validation for external consumers

---

## Error Handling

### Global Error Handler (`middlewares/errorHandler.js`)

All errors are caught by the global error handler at the end of the middleware chain. The flow is:

1. **Synchronous errors** — Automatically caught by Express.
2. **Async errors** — Wrapped by `asyncHandler.js` which passes the error to `next()`.
3. **Custom errors** — Controllers/services throw errors with `statusCode` property for specific HTTP codes.
4. **Generic errors** — Default to `500 Internal Server Error` with optional stack trace (dev only).

```
asyncHandler wraps every controller method
  │
  ▼
Controller throws error (or passes to next())
  │
  ▼
errorHandler middleware formats response
  │
  ▼
{
  success: false,
  message: "Human-readable message",
  statusCode: 400 | 404 | 500,
  stack: "..." // DEVELOPMENT ONLY
}
```

### 404 Handler

Any unmatched route returns:

```json
{
  "success": false,
  "message": "Route not found"
}
```

### Query Validation (`middlewares/validateQuery.js`)

Validates `page` (positive integer), `limit` (positive integer), and `sortOrder` (`asc`/`desc`). Throws `400 Bad Request` with descriptive messages on invalid input.

---

## Seed Script

Located at `src/scripts/seed.js`. Populates the `insights` collection from `jsondata.json`.

### Transform Pipeline

1. Reads raw JSON array from `jsondata.json`
2. Transforms each record:
   - Parses `end_year`/`start_year` as integers (or `null`)
   - Parses `added`/`published` date strings (custom format `"January, 15 2023 14:30:00"`)
   - Maps field names to schema-compatible format
   - Validates numeric fields
3. Inserts into MongoDB via `insertMany` (with `ordered: false` for partial insert tolerance)
4. Logs success/failure counts and error details

### Error Handling

The seed script handles:
- Missing or invalid data file
- Empty data array
- Schema validation errors
- Network/DNS errors (connection refused, host not found)
- Mongoose buffering timeout
- Partial insert errors (via `writeErrors`)

### Usage

```bash
# Fresh insert (appends to existing data)
npm run seed

# Clear existing data first, then insert
npm run seed:fresh
```

---

## Deployment

### Vercel (Serverless)

The backend is Vercel-ready with a serverless entry point at `api/index.js`.

```bash
vercel --prod
```

The `vercel.json` configuration:

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
}
```

The `db.js` connection module uses a global cache pattern (`global._mongooseCache`) to reuse database connections across serverless invocations, avoiding connection pool exhaustion.

### Traditional Server

```bash
NODE_ENV=production PORT=4000 npm start
```

Environment variables can be set via system environment or `.env` file.

### Environment Considerations

| Environment | Recommended Host | Notes |
|-------------|-----------------|-------|
| Development | Local machine | Vite proxy handles CORS |
| Production | Vercel | Serverless, auto-scaling |
| Production | VPS / Docker | Traditional Node.js process |

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| `MongoDB connection failed` | Invalid `MONGODB_URI` | Check Atlas credentials and cluster name in `.env` |
| `ECONNREFUSED` | MongoDB not running / Atlas IP not whitelisted | Add your IP to Atlas Network Access or start local MongoDB |
| CORS errors | `CORS_ORIGIN` doesn't match frontend URL | Set `CORS_ORIGIN=http://localhost:5173` (dev) or your deployed frontend URL |
| `Route not found` | Wrong URL path | Check the request URL matches one of the documented endpoints |
| Text search returns no results | Text index missing | Run `db.insights.createIndex({ title: "text", insight: "text" })` in MongoDB shell or Compass |
| Seed script fails with `buffering` | Connection not ready | Ensure `MONGODB_URI` is correct and network is accessible |
| Serverless timeout (Vercel) | Cold start + large dataset | Reduce default `limit` value or implement cursor-based pagination |

---

## Best Practices

- **Use query parameters for filtering** — All filter dimensions are passed as URL query params; the service layer builds safe MongoDB queries.
- **No direct model access in controllers** — Controllers delegate to services, services use models.
- **Whitelisted sort fields** — `buildSortOption()` only allows predefined field names to prevent injection.
- **Parallel aggregation** — The stats endpoint runs 6 pipelines concurrently with `Promise.all`.
- **Serverless-ready connection** — The cached connection pattern in `db.js` handles cold starts efficiently.
- **Meaningful error messages** — All errors include descriptive messages and appropriate HTTP status codes.
- **Stack traces in dev only** — `config.isProduction` controls stack trace visibility.
