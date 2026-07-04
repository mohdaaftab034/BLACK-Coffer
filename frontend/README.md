# Blackcoffer Dashboard — Frontend

> React 19 SPA for exploring, filtering, and visualizing intelligence insights. Built with Vite, Tailwind CSS, Zustand, Recharts, and D3.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routing & Pages](#routing--pages)
- [Component Organization](#component-organization)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Data Flow](#data-flow)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Tech Stack

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `react` | ^19.1.0 | UI framework |
| `react-dom` | ^19.1.0 | DOM rendering |
| `react-router-dom` | ^7.6.1 | Client-side routing |
| `vite` | ^7.0.0 | Build tool & dev server |
| `tailwindcss` | ^4.1.6 | Utility-first CSS |
| `@vitejs/plugin-react` | ^4.4.1 | React Fast Refresh |
| `@tailwindcss/vite` | ^4.1.6 | Tailwind Vite plugin |
| `zustand` | ^5.0.5 | State management |
| `recharts` | ^2.15.3 | Chart components |
| `d3` | ^7.9.0 | Custom chart rendering |
| `framer-motion` | ^12.9.2 | Animations |
| `lucide-react` | ^0.511.0 | Icon library |
| `clsx` | ^2.1.1 | Conditional classes |

---

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── AreaChart.jsx             # Year-over-year area chart (Recharts)
│   │   │   ├── BubbleChart.jsx           # Likelihood vs Relevance scatter (D3)
│   │   │   ├── CardShell.jsx             # Chart wrapper with title & animation
│   │   │   ├── DonutChart.jsx            # Distribution donut (Recharts)
│   │   │   ├── HeatmapChart.jsx          # Sector x PESTLE heatmap (CSS grid)
│   │   │   ├── HorizontalBarChart.jsx    # Horizontal bars (D3)
│   │   │   ├── KpiCards.jsx              # 5 KPI metric cards
│   │   │   └── RadarChartComponent.jsx   # Multi-axis radar (Recharts)
│   │   ├── filters/
│   │   │   └── FilterBar.jsx             # Multi-dimensional filter controls
│   │   ├── layout/
│   │   │   ├── AppShell.jsx              # Master layout (sidebar + navbar + content)
│   │   │   ├── Navbar.jsx                # Top navigation bar
│   │   │   ├── Sidebar.jsx               # Collapsible left sidebar
│   │   │   └── SideDrawer.jsx            # Reusable slide-in panel
│   │   ├── notifications/
│   │   │   └── NotificationsPanel.jsx    # Notification slide-out drawer
│   │   └── search/
│   │       └── SearchOverlay.jsx         # Full-screen modal search
│   ├── pages/
│   │   ├── Overview.jsx                  # Dashboard home (KPIs + charts)
│   │   ├── InsightsExplorer.jsx          # Table view with sort & detail
│   │   ├── Geography.jsx                 # Regional & country analysis
│   │   ├── SectorsTopics.jsx             # Sector & topic breakdown
│   │   └── Settings.jsx                  # Theme & sidebar preferences
│   ├── services/
│   │   └── api.js                        # Centralized API client
│   ├── store/
│   │   ├── filterStore.js                # Active filter state
│   │   ├── notificationStore.js          # Notification panel state
│   │   ├── searchStore.js                # Search overlay state
│   │   └── themeStore.js                 # Dark mode & sidebar state
│   ├── utils/
│   │   └── dataHelpers.js                # Aggregation & transformation utilities
│   ├── App.jsx                           # Root component with router
│   ├── main.jsx                          # Application entry point
│   └── index.css                         # Global styles + Tailwind imports
├── index.html                            # HTML template
├── vite.config.js                        # Vite configuration
├── vercel.json                           # SPA rewrites for deployment
├── .env                                  # Environment variables
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Install

```bash
cd frontend
npm install
```

### Configure Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=/api
```

In development, Vite proxies `/api/*` to `http://localhost:4000` (configured in `vite.config.js`). In production, set this to your deployed backend URL.

### Start Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173` with Hot Module Replacement (HMR).

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `VITE_API_BASE_URL` | `/api` | Yes | Base path for API requests |

All Vite env vars must be prefixed with `VITE_` to be exposed to the client.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build locally |

---

## Routing & Pages

All routes are defined in `src/App.jsx` using React Router DOM v7.

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `Overview.jsx` | Main dashboard — KPIs, bubble map, sector bars, topic donut, year area, PESTLE radar, region insights |
| `/insights` | `InsightsExplorer.jsx` | Tabular data view with search, sort, pagination, detail panel, and CSV export |
| `/geography` | `Geography.jsx` | Region bar chart + top countries list with detail cards |
| `/sectors` | `SectorsTopics.jsx` | Sector comparison chart, topic frequency, sector x PESTLE heatmap |
| `/settings` | `Settings.jsx` | Dark mode and sidebar collapse toggles |
| `*` | Redirect → `/` | Catch-all redirect |

All page transitions use `<AnimatePresence mode="wait">` from Framer Motion for smooth enter/exit animations.

---

## Component Organization

### Chart Components (`components/charts/`)

| Component | Library | Data Source | Description |
|-----------|---------|-------------|-------------|
| `KpiCards` | — | `getStats()` | 5 cards: Total Insights, Avg Intensity, Avg Likelihood, Avg Relevance, Top Sector |
| `BubbleChart` | D3 | `getFilteredData()` | Likelihood (x) vs Relevance (y), Intensity as radius, colored by sector |
| `HorizontalBarChart` | D3 | `getStats()` → `countBySector` | Sector-wise average intensity bars |
| `DonutChart` | Recharts | `getStats()` → `countByTopic` | Topic distribution with percentages |
| `AreaChart` | Recharts | `getFilteredData()` → getYearData() | Year-over-year insight volume |
| `RadarChartComponent` | Recharts | `getStats()` → `countByPestle` | PESTLE multi-axis comparison |
| `HeatmapChart` | CSS Grid | `getFilteredData()` → getHeatmapData() | Sector × PESTLE intensity matrix |
| `CardShell` | — | — | Reusable animated card wrapper with title |

### Layout Components (`components/layout/`)

```
AppShell (master layout)
├── Sidebar (desktop, collapsible)
├── SideDrawer (mobile sidebar)
├── Navbar (top bar: title, search, theme, notifications, avatar)
└── <main> (page content)
```

### Feature Components

| Component | Description |
|-----------|-------------|
| `FilterBar` | Multi-dimensional filter controls — dropdowns for year, topic, sector, region, PESTLE, source, country, SWOT. Desktop: inline dropdowns. Mobile: bottom sheet. Supports `select`, `multi`, `searchable`, `searchable-multi` types. |
| `SearchOverlay` | Full-screen modal triggered by `Cmd+K` / `Ctrl+K`. Searches filter options + insight data via debounced API calls. Keyboard-navigable. |
| `NotificationsPanel` | Slide-out drawer with "All" / "Unread" tabs, mark-as-read, and 7 mock notification types with distinct icons/colors. |

---

## State Management

The app uses **Zustand 5** with four independent stores:

### `useFilterStore` (`store/filterStore.js`)

Central filter state shared across all pages.

```js
const filters = useFilterStore()
filters.endYear        // string
filters.topics         // string[]
filters.sectors        // string[]
filters.regions        // string[]
filters.pestle         // string[]
filters.source         // string
filters.swot           // string[]
filters.countries      // string[]
filters.city           // string

filters.setFilter(key, value)        // Update any filter
filters.clearFilters()               // Reset all filters
filters.getActiveFilterCount()       // Number of active filters
filters.recentlyApplied              // { key, value, id } for pulse animation
```

### `useThemeStore` (`store/themeStore.js`)

```js
const theme = useThemeStore()
theme.dark                    // boolean (persisted to localStorage: 'blackcoffer_theme')
theme.sidebarCollapsed        // boolean
theme.toggleDark()            // Toggle dark mode
theme.toggleSidebar()         // Toggle sidebar collapse
theme.setSidebarCollapsed(v)  // Programmatic set
```

### `useSearchStore` (`store/searchStore.js`)

```js
const search = useSearchStore()
search.isOpen     // boolean
search.open()     // Open search overlay
search.close()    // Close search overlay
search.toggle()   // Toggle search overlay
```

### `useNotificationStore` (`store/notificationStore.js`)

```js
const notifications = useNotificationStore()
notifications.isOpen          // boolean
notifications.activeTab       // 'all' | 'unread'
notifications.notifications   // Notification[]
notifications.unreadCount     // number
notifications.open() / close() / toggle()
notifications.setTab(tab)
notifications.markAllAsRead()
notifications.markAsRead(id)
```

---

## API Layer

All backend communication goes through `src/services/api.js`.

### Request Flow

```
Component
  └─► services/api.js (base URL from VITE_API_BASE_URL)
        └─► fetch() → JSON response
              └─► Returns parsed data or throws on error
```

### Available Functions

```js
// Get filtered insights
getFilteredData(filters)       → GET /api/insights?page=1&limit=10000&topic=...

// Get distinct filter options (for dropdowns)
getUniqueFilterOptions()       → GET /api/insights/filters

// Get aggregated stats and breakdowns
getStats(filters)              → GET /api/insights/stats?topic=...

// Get single insight by ID
getInsightById(id)             → GET /api/insights/:id
```

### Error Handling

All API errors throw an `Error` with a message extracted from the response body or HTTP status code. Components handle these with try/catch and display error states with retry buttons.

---

## Data Flow

```
Page mounts
  ├─► getFilteredData(filters) → populates chart data
  ├─► getStats(filters)        → populates KPI cards & breakdowns
  └─► getUniqueFilterOptions() → populates filter dropdowns
        │
User changes filter ──► useFilterStore.setFilter()
        │
All pages re-fetch ──► React re-render with new data
```

The `FilterBar` component updates `useFilterStore` when the user selects or clears filters. Every page reads from the same store, so changing filters updates all visualizations automatically.

---

## Error Handling

- **API errors**: Caught in page components with `try/catch`. Displayed as inline error messages with a "Retry" button.
- **Loading states**: Skeleton placeholders shown while data is fetching.
- **Empty states**: Graceful "No data available" messages when filters return zero results.
- **Network errors**: Descriptive error messages from the API client.

---

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

The `vercel.json` rewrites all routes to `index.html` for SPA client-side routing support.

### Other Static Hosts

```bash
npm run build
# Serve the dist/ directory with any static server
```

For non-proxied deployments, update `VITE_API_BASE_URL` to your backend URL before building:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Failed to load resource: net::ERR_CONNECTION_REFUSED` | Ensure the backend is running on port 4000 |
| CORS errors | Verify `CORS_ORIGIN` in backend `.env` matches `http://localhost:5173` |
| Blank page after build | Check Vite build logs; verify `vercel.json` rewrites |
| Filters not working | Open DevTools Network tab to verify API query params |
| Search returns no results | Ensure MongoDB text index exists on `title` and `insight` fields |
| HMR not working | Ensure Vite and React versions are compatible |

---

## Best Practices

- **Keep components focused** — Each component has a single responsibility (chart, layout, feature).
- **Use the store for shared state** — Page-local state stays in `useState`; cross-page state goes in Zustand.
- **Batch API calls** — Pages fire independent requests in parallel (`Promise.all`).
- **Memoize heavy computations** — Use `useMemo` for data transformations (e.g., `getYearData`, `getHeatmapData`).
- **Handle all states** — Every data-fetching component handles loading, error, and empty states.
- **Use `VITE_` prefix** — Only `VITE_*` env vars are available to client code.
- **Dark mode compatibility** — All chart components check `useThemeStore().dark` to switch color scales.
