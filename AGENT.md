# Weekly Health

## Overview

A natural language calorie & activity tracker. Users log meals and activities by describing them in plain English via an AI chat interface. The LLM extracts nutritional/activity data using tool calling and stores it. Users track calories, macros, and activity on a weekly basis.

---

## Monorepo Structure

```
pnpm-workspace.yaml          # pnpm workspaces config
├── apps/
│   ├── native/              # Expo (React Native) — PRIMARY app
│   ├── pwa/                 # React + Vite web app (secondary, not active focus)
│   ├── backend/             # AWS CDK infrastructure + Lambda functions
│   └── express/             # Local dev Express server
├── packages/
│   ├── core/                # Domain entities, DTOs, Zod schemas, constants, utilities
│   ├── api/                 # Backend services, DI container, repo interfaces
│   └── frontend/            # API client, React context/provider, shared query hooks
└── patches/                 # pnpm patch overrides
```

---

## Tech Stack

| Layer       | Technology                                                   |
| ----------- | ------------------------------------------------------------ |
| Mobile App  | Expo (React Native), Expo Router (file-based routing)        |
| Styling     | Tailwind CSS 4 + UniWind (className-based, no inline styles) |
| State       | TanStack React Query                                         |
| Auth        | Clerk (Google Sign-In, Apple Sign-In planned)                |
| Chat UI     | @assistant-ui/react-native, @assistant-ui/react-ai-sdk       |
| API         | AWS API Gateway (HTTP API) with JWT Authorizer               |
| Backend     | AWS Lambda (Node.js 20), CDK                                 |
| Database    | DynamoDB (single-table, user-scoped)                         |
| Package Mgr | pnpm (workspaces)                                            |

---

## Where Things Go

### `packages/core`
- Domain entities (`MealEntry`, `ActivityEntry`, `Profile`, `WeeklyStat`, `DailyStat`, `Nutrients`)
- DTOs and Zod validation schemas
- Constants (calorie defaults, macro ratios)
- Pure utility functions (date helpers, calculations)
- UI flow definitions (tool UI schemas)

### `packages/api`
- Backend service classes (`ChatService`, `MealService`, `ProfileService`, `QueryService`, `ActivityService`)
- DI container setup (`createRequestContainer`, `initContainer`)
- Repository interfaces (abstractions over DynamoDB)

### `packages/frontend`
- `createApiClient()` — HTTP client factory (takes `baseUrl` + `getToken`)
- `ApiProvider` / `useApi()` — React context for API access
- Shared query hooks (`useEntriesByDateQuery`, `useSummaryQuery`, etc.)

### `apps/native`
- **`app/`** — Expo Router pages (file-based routing)
- **`components/`** — UI components, organized by feature (`dashboard/`, `chat/`)
- **`hooks/`** — App-level hooks (`use-api`, `use-auth`, `use-summary-query`, etc.)
- **`lib/`** — Config, constants
- **`assets/`** — Icons, images

### `apps/backend`
- **`bin/`** — CDK app entry point
- **`lib/`** — CDK stack definitions (`backend-stack.ts`, `frontend-stack.ts`)
- **`functions/`** — Lambda handler code (`data/`, `chat/`)
- **`repo/`** — DynamoDB repository implementations
- **`services/`** — Backend-only services

---

## Data Model

**DynamoDB — Single Table Design**
- PK: `USER#<clerkUserId>`
- SK: `DATE#YYYY-MM-DD#ENTRY#<uuid>`

---

## API Endpoints

### API Gateway (JWT-protected)

| Method | Path                      | Description                      |
| ------ | ------------------------- | -------------------------------- |
| GET    | `/summary`                | App init data for current period |
| GET    | `/weeks/{weekId}`         | Get specific week summary        |
| GET    | `/entries/{date}`         | Get meal entries for a date      |
| POST   | `/entries`                | Create meal entry                |
| PUT    | `/entries/{date}/{id}`    | Update meal entry                |
| DELETE | `/entries/{date}/{id}`    | Delete meal entry                |
| POST   | `/profile`                | Create user profile              |
| PUT    | `/profile`                | Update user profile              |
| GET    | `/activities/{date}`      | Get activity entries for a date  |
| POST   | `/activities`             | Create activity entry            |
| PUT    | `/activities/{date}/{id}` | Update activity entry            |
| DELETE | `/activities/{date}/{id}` | Delete activity entry            |

### Chat Lambda (Function URL, streaming)

| Method | Endpoint            | Description                             |
| ------ | ------------------- | --------------------------------------- |
| POST   | `{chatFunctionUrl}` | Streaming AI chat with JWT verification |

---

## Rules

### Code Conventions

- **Reuse existing components** — Always check `apps/native/components/` and `packages/` before creating something new. Do not duplicate what already exists.
- **Do not reinvent libraries** — If a capability is already available via an installed dependency, use it. Do not write custom implementations for things like date formatting, animations, keyboard handling, etc.
- **Use shared packages** — Domain types go in `packages/core`. API logic goes in `packages/frontend` or `packages/api`. Never define DTOs or entities inside `apps/`.
- **className-only styling** — Use Tailwind/UniWind utility classes via `className`. Never use inline `style` props except for truly dynamic computed values with no Tailwind equivalent (e.g., percentage widths from calculations, `contentContainerStyle` on ScrollView).
- **Minimal comments** — Only comment non-obvious logic. Let code speak for itself.
- **No default exports** — Use named exports everywhere for better refactoring and IDE support.
- **Barrel files** — Each feature folder should have an `index.ts` that re-exports its public API.

### E2E Testing

See [`apps/native-e2e/CONVENTIONS.md`](apps/native-e2e/CONVENTIONS.md) for Maestro + React Native iOS testing conventions.


