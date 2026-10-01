# Website Report Generator – Frontend

React (Vite) app for generating website content reports and viewing, downloading and sharing them.

## Stack

React 19 · Vite · Material UI · React Router v6 · TanStack React Query · Axios · React Hook Form + Zod · Vitest + Testing Library

## Setup

```powershell
cd Frontend
npm install
Copy-Item .env.example .env
npm run dev          # http://localhost:3000
```

The backend must be running on http://localhost:8000. In development, Vite proxies `/api` to it
(see `vite.config.js`), so the browser only talks to `localhost:3000`.

## Pages

| Route | Page |
|---|---|
| `/` | Enter a website URL and generate a report |
| `/reports` | Search, paginate, view, download (PDF/DOCX/PPT), copy link, delete |
| `/r/:slug` | Public shareable report page: HTML view / PDF view / Slides tabs and download buttons |

The HTML, PDF and slide views are rendered by the backend and shown in an `<iframe>`, so no raw HTML is
injected into React. The header logo is `public/E2M_Logo-Black.png`; the backend uses the same file for
the PDF and DOCX headers.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Unit and integration tests (Vitest) |

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL for API calls, links and iframes |
| `VITE_API_PROXY_TARGET` | `http://localhost:8000` | Where the dev server proxies `/api` |
## Folder layout

```
src/
├── components/common/   Loader, ErrorState, EmptyState, ConfirmDialog, ErrorBoundary, Notifications
├── components/layout/   Header, Sidebar, MainLayout
├── config/              app, env and route configuration
├── features/reports/    components, hooks (React Query), services (API calls), utils
├── hooks/               useDebounce, useNotification, useCopyToClipboard
├── pages/               Home, Reports, ReportView, NotFound (lazy-loaded)
├── routes/              route table
├── services/api/        axios instance, endpoints, error interceptor
├── styles/              MUI theme, global CSS, CSS variables
└── utils/               constants, formatters, validators
tests/
├── unit/                validators, formatters, API error handling
└── integration/         Home, Reports and ReportView pages with a mocked API
```
