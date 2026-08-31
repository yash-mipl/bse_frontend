# BSE Frontend

React + TypeScript frontend scaffolded with [Vite](https://vite.dev/).

## Prerequisites

- **Node.js** 20+ (tested with v22)
- **npm** 10+

## Quick start

```bash
cd frontend
npm install
cp .env.example .env.local   # optional — .env.local is gitignored
npm run dev
```

Dev server: **http://localhost:5173** (opens automatically).

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start dev server with HMR            |
| `npm run build`   | Type-check + production build        |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Run Oxlint                           |

## Project structure

```
frontend/
├── public/                 # Static assets (copied as-is to dist/)
├── src/
│   ├── assets/             # Images, fonts, etc. (imported in code)
│   ├── components/         # Reusable UI components
│   │   └── layout/         # Shell components (Header, Layout, …)
│   ├── config/             # App configuration (env, constants)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-level page components
│   ├── services/           # API clients & external integrations
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Pure helper functions
│   ├── App.tsx             # Root component
│   ├── main.tsx            # React entry point
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite env variable typings
├── .env.example            # Environment variable template
├── index.html              # HTML entry (Vite injects scripts here)
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript project references
├── tsconfig.app.json       # App TypeScript config
└── tsconfig.node.json      # Node/build-tool TypeScript config
```

## Path aliases

Import from `src/` using the `@/` prefix:

```tsx
import { Layout } from '@/components/layout/Layout'
import { api } from '@/services/api'
import { env } from '@/config/env'
```

Configured in `vite.config.ts` and `tsconfig.app.json`.

## Environment variables

Only variables prefixed with `VITE_` are exposed to the browser.

1. Copy `.env.example` → `.env.local`
2. Edit values as needed
3. Add new variables to both `.env.example` and `src/vite-env.d.ts`
4. Access via `src/config/env.ts` (typed wrapper)

| Variable              | Default                      | Description        |
| --------------------- | ---------------------------- | ------------------ |
| `VITE_APP_NAME`       | `BSE`                        | App display name   |
| `VITE_API_BASE_URL`   | `http://localhost:3000/api`  | Backend API base   |

## API layer

`src/services/api.ts` provides a typed fetch wrapper:

```ts
import { api } from '@/services/api'

const users = await api.get<User[]>('/users')
await api.post('/users', { name: 'Jane' })
```

During development, Vite proxies `/api/*` to `http://localhost:3000` (see `vite.config.ts`).

## Adding pages & routing

This scaffold has no router yet. When you need multiple routes, install React Router:

```bash
npm install react-router-dom
```

Then wrap `App` with `BrowserRouter` and define routes in `src/App.tsx` or a dedicated `src/routes.tsx`.

## Production build

```bash
npm run build    # outputs to frontend/dist/
npm run preview  # preview at http://localhost:4173
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, S3, Nginx, etc.).

## Tech stack

- **React 19** — UI library
- **TypeScript 6** — Static typing
- **Vite 8** — Build tool & dev server
- **Oxlint** — Fast linter
