# Blackcoffer Dashboard

> A full-stack data visualization dashboard for exploring, filtering, and analyzing intelligence insights across sectors, regions, topics, and time. Built with React, Express, and MongoDB.

[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)](#)
[![Tech Stack](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](#)
[![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](#)
[![Tech Stack](https://img.shields.io/badge/Express-4-000000?logo=express)](#)
[![Tech Stack](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)](#)
[![Tech Stack](https://img.shields.io/badge/Zustand-5-000000)](#)

---

## Quick Overview

| Layer | Technology | Directory |
|-------|-----------|-----------|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS 4 | [`frontend/`](./frontend) |
| **Backend** | Express 4 + Mongoose 8 | [`backend/`](./backend) |
| **Database** | MongoDB (Atlas or local) | `blackcoffer_dashboard` |
| **State** | Zustand 5 | `frontend/src/store/` |
| **Charts** | Recharts 2 + D3 7 | `frontend/src/components/charts/` |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌───────────────────────────────────────────┐  │
│  │        React SPA (Vite dev :5173)          │  │
│  │  ┌──────────┐  ┌──────┐  ┌────────────┐  │  │
│  │  │ Zustand  │  │Pages │  │ Components │  │  │
│  │  │ Stores   │──│      │──│ (Charts,    │  │  │
│  │  │          │  │      │  │  Layout,    │  │  │
│  │  │          │  │      │  │  Filters)   │  │  │
│  │  └──────────┘  └──────┘  └────────────┘  │  │
│  │                   │                        │  │
│  │          ┌────────┴────────┐               │  │
│  │          │  services/api.js │               │  │
│  │          └────────┬────────┘               │  │
│  └───────────────────┼───────────────────────┘  │
│                      │ HTTP (proxy :4000)       │
├──────────────────────┼─────────────────────────┤
│        Backend       │                          │
│  ┌───────────────────┴───────────────────────┐  │
│  │           Express Server                   │  │
│  │  ┌──────────┐  ┌────────┐  ┌───────────┐  │  │
│  │  │ Routes   │──│Controllers│──│ Services  │  │
│  │  └──────────┘  └────────┘  └─────┬─────┘  │  │
│  │                                   │         │  │
│  │                           ┌───────┴───────┐ │  │
│  │                           │  Mongoose      │ │  │
│  │                           │  Model         │ │  │
│  │                           └───────┬───────┘ │  │
│  └───────────────────────────────────┼─────────┘  │
└──────────────────────────────────────┼───────────┘
                                       │
                              ┌────────┴────────┐
                              │    MongoDB       │
                              │  (Atlas / Local) │
                              └─────────────────┘
```

---

## Folder Structure

```
BLACK-Coffer/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/          # Recharts & D3 chart components
│   │   │   ├── filters/         # Filter bar & dropdowns
│   │   │   ├── layout/          # App shell, sidebar, navbar, drawer
│   │   │   ├── notifications/   # Notification panel
│   │   │   └── search/          # Search overlay
│   │   ├── pages/               # Route-level page components
│   │   ├── services/            # API client layer
│   │   ├── store/               # Zustand state stores
│   │   ├── utils/               # Data helper utilities
│   │   ├── App.jsx              # Root component + routing
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── config/              # DB connection & env config
│   │   ├── controllers/         # Route handlers
│   │   ├── middlewares/         # Error, validation, async wrapper
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express route definitions
│   │   ├── scripts/             # Database seed script
│   │   ├── services/            # Business logic layer
│   │   ├── utils/               # Date parsing utilities
│   │   └── app.js               # Express app setup
│   ├── api/index.js             # Serverless entry point
│   ├── server.js                # Dev/prod entry point
│   ├── jsondata.json            # Source dataset
│   └── vercel.json
│
└── README.md                    # You are here
```

---

## Features

- **Interactive Dashboards** — Overview KPIs, charts, and geographic breakdowns
- **Multi-Dimensional Filtering** — Filter by sector, region, topic, PESTLE, country, year, SWOT, and more
- **Advanced Visualizations** — Area charts, donut charts, radar charts, bubble charts, heatmaps, bar charts (Recharts + D3)
- **Full-Text Search** — Search across insight titles and content with keyboard shortcut (`Cmd+K`)
- **Dark Mode** — Persistent theme toggle with localStorage
- **Responsive Design** — Mobile sidebar drawer, adaptive layouts, touch-friendly
- **Insights Explorer** — Paginated, sortable, searchable table with detail panels and CSV export
- **Notification Center** — Mock notification panel with read/unread management
- **Serverless Ready** — Vercel deployment support for both frontend and backend

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### 1. Clone & Install

```bash
git clone <repo-url>
cd BLACK-Coffer

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** — Create `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/blackcoffer_dashboard
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend** — Create `frontend/.env`:

```env
VITE_API_BASE_URL=/api
```

### 3. Seed the Database

```bash
cd backend
npm run seed
# Or to clear existing data first:
npm run seed:fresh
```

### 4. Start Development

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # starts on :4000

# Terminal 2 — Frontend
cd frontend
npm run dev        # starts on :5173
```

Visit `http://localhost:5173` — the Vite dev server proxies `/api` requests to `http://localhost:4000`.

---

## Documentation

| Resource | Link |
|----------|------|
| Frontend guide | [`frontend/README.md`](./frontend/README.md) |
| Backend API docs | [`backend/README.md`](./backend/README.md) |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel --prod
```

The `vercel.json` rewrites all routes to `index.html` for SPA support.

### Backend → Vercel (Serverless)

```bash
cd backend
vercel --prod
```

The `vercel.json` routes all traffic through `api/index.js` using `@vercel/node`. The `db.js` connection cache pattern supports serverless cold starts.

### Traditional Hosting

```bash
cd backend
NODE_ENV=production npm start
```

The frontend build can be served by any static host (Nginx, S3, etc.) — set `VITE_API_BASE_URL` to your backend URL before building.

---

## Tech Stack

### Frontend

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| React Router DOM 7 | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Zustand 5 | Lightweight state management |
| Recharts 2 | React-native chart components |
| D3 7 | Custom chart rendering |
| Framer Motion 12 | Page/component animations |
| Lucide React | Icon library |
| clsx | Conditional class utilities |

### Backend

| Library | Purpose |
|---------|---------|
| Express 4 | HTTP server & routing |
| Mongoose 8 | MongoDB ODM |
| Helmet 7 | Security headers |
| CORS | Cross-origin requests |
| Morgan | HTTP request logging |
| dotenv | Environment variable management |
| express-rate-limit | Rate limiting |
| Nodemon | Dev auto-restart |

### Database

| Component | Detail |
|-----------|--------|
| Engine | MongoDB 7+ |
| ODM | Mongoose 8 |
| Hosting | MongoDB Atlas (default) or local |
| Collections | 1 (`insights`) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing patterns and conventions used throughout the project.

---

## License

MIT

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection failed` | Check `MONGODB_URI` in `backend/.env` and network access in Atlas |
| `ECONNREFUSED` | Ensure MongoDB is running or Atlas IP whitelist allows your IP |
| CORS errors in browser | Verify `CORS_ORIGIN` in `backend/.env` matches your frontend URL |
| Blank page on deploy | Check Vite build logs; ensure `vercel.json` rewrites are correct |
| Search returning no results | Ensure text index exists: `db.insights.createIndex({ title: "text", insight: "text" })` |
