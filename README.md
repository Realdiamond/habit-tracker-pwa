# Habit Tracker PWA

A Progressive Web Application for tracking daily habits, built with **Next.js 16**, **React 19**, and **TypeScript**. All data is persisted entirely in the browser using `localStorage` — no backend required.

## Project Overview

This app lets users sign up, log in, and manage a personal list of daily habits. Each habit tracks a completion history and calculates the current streak of consecutive days completed. The dashboard is scoped to the logged-in user, so multiple users on the same browser see only their own habits.

### Key Features

- **Authentication** — Email/password signup and login with localStorage-backed sessions.
- **Habit CRUD** — Create, edit, and delete habits with validation (name required, max 60 chars).
- **Completion Toggle** — Mark a habit as done/undone for today; streak recalculates instantly.
- **User Isolation** — Each user only sees their own habits on the dashboard.
- **Offline Support** — Service worker caches the app shell (network-first strategy).
- **Splash Screen** — 1.5-second animated splash with auth-aware redirect.

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install

```bash
git clone <repo-url> habit-tracker-pwa
cd habit-tracker-pwa
npm install
```

### Install Playwright Browsers (for E2E tests)

```bash
npx playwright install chromium
```

---

## Run Instructions

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

---

## Test Instructions

### Run All Tests

```bash
npm test
```

This runs unit → integration → E2E in sequence.

### Run Individual Suites

| Command                   | Suite              | Framework             |
|---------------------------|--------------------|-----------------------|
| `npm run test:unit`       | Unit tests         | Vitest + v8 coverage  |
| `npm run test:integration`| Integration tests  | Vitest + React Testing Library |
| `npm run test:e2e`        | End-to-end tests   | Playwright (Chromium) |

> **Note:** E2E tests require the dev server to be running on port 3000. Start it with `npm run dev` in a separate terminal before running `npm run test:e2e`.

---

## Local Persistence Structure

All state is stored in `localStorage` under three keys:

### `habit-tracker-users`

An array of registered users.

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "password": "plaintext",
    "createdAt": "2025-04-25T12:00:00.000Z"
  }
]
```

### `habit-tracker-session`

The currently logged-in user's session. Set on login/signup, removed on logout.

```json
{
  "userId": "uuid",
  "email": "user@example.com"
}
```

### `habit-tracker-habits`

All habits across all users. The dashboard filters by `userId` at read time.

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Drink Water",
    "description": "Stay hydrated",
    "frequency": "daily",
    "createdAt": "2025-04-25T12:00:00.000Z",
    "completions": ["2025-04-25", "2025-04-24"]
  }
]
```

> **Design note:** Passwords are stored in plain text because this is a client-only demo with no server. The Technical Requirements Document explicitly defines this shape.

---

## PWA Implementation

### Service Worker (`public/sw.js`)

The service worker implements a **network-first** caching strategy:

1. **Install** — Pre-caches the app shell (routes `/`, `/login`, `/signup`, `/dashboard`, manifest, icons).
2. **Activate** — Cleans up old cache versions.
3. **Fetch** — Attempts the network first. If the network request fails (offline), falls back to the cached version.

### Web App Manifest (`public/manifest.json`)

Provides PWA metadata (name, icons, theme color, display mode) so the app can be installed to the home screen.

### Registration (`src/app/layout.tsx`)

The root layout registers the service worker on mount via a `useEffect` in a client component.

### Trade-off

The TRD requires "cache the app shell and prevent a hard crash offline." The current implementation meets this minimum. It does not use Workbox or advanced runtime caching for API responses (there are none — all data is in localStorage). This keeps the service worker simple and avoids cache-staleness bugs.

---

## Trade-offs and Limitations

| Area | Decision | Rationale |
|------|----------|-----------|
| **Auth** | Plain-text passwords, no hashing | Client-only demo per TRD spec; no server to protect |
| **Storage** | Single `localStorage` store, no IndexedDB | Sufficient for the scale; TRD mandates specific `localStorage` keys |
| **Streak calculation** | UTC-only date arithmetic | Eliminates timezone-drift bugs across machines/CI (see `src/lib/streaks.ts`) |
| **PWA offline** | Network-first, no Workbox | Meets TRD minimum without overcomplicating the service worker |
| **E2E soft navigation** | Tests use `waitForFunction` to poll `window.location.pathname` | Playwright's `waitForURL` doesn't detect Next.js `router.push/replace` (soft navigations) |
| **Frequency** | Hardcoded to `'daily'` | The TRD defines a single frequency; the type allows extension later |

---

## Test File Map

### Unit Tests (`tests/unit/`)

| File | Verifies |
|------|----------|
| `slug.test.ts` | `generateSlug()` — lowercases, replaces spaces with hyphens, strips special characters |
| `validators.test.ts` | `isValidHabitName()` — rejects empty/whitespace-only names, enforces 60-char limit, accepts valid names |
| `streaks.test.ts` | `calculateCurrentStreak()` — returns 0 for empty or non-today completions, counts consecutive days, handles duplicates, breaks on gaps |
| `habits.test.ts` | `toggleCompletion()` — adds today's date when uncompleted, removes it when already completed, preserves other dates, handles empty array |

### Integration Tests (`tests/integration/`)

| File | Verifies |
|------|----------|
| `auth-flow.test.tsx` | Signup creates user + session in `localStorage`, duplicate email shows error, login stores session, wrong password shows error |
| `habit-form.test.tsx` | Empty name shows validation error, create renders habit card, edit preserves `id`/`createdAt`, delete requires confirmation dialog, toggle updates streak display |

### E2E Tests (`tests/e2e/`)

| File | Verifies |
|------|----------|
| `app.spec.ts` | Full application lifecycle across 10 scenarios: splash redirect, auth guard, signup flow, user isolation, habit CRUD, streak update, persistence after reload, logout, and offline app shell caching |

---

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Splash screen route (/)
│   ├── login/page.tsx       # Login route (/login)
│   ├── signup/page.tsx      # Signup route (/signup)
│   ├── dashboard/page.tsx   # Protected dashboard (/dashboard)
│   ├── layout.tsx           # Root layout + SW registration
│   └── globals.css          # Tailwind + custom design tokens
├── components/
│   ├── auth/                # LoginForm, SignupForm
│   ├── habits/              # HabitCard, HabitForm, HabitList
│   └── shared/              # SplashScreen, ProtectedRoute
├── lib/                     # Pure logic (no React)
│   ├── auth.ts              # signup, login, logout, getCurrentSession
│   ├── constants.ts         # STORAGE_KEYS, validation limits
│   ├── habits.ts            # toggleCompletion
│   ├── slug.ts              # generateSlug
│   ├── storage.ts           # localStorage CRUD abstraction
│   ├── streaks.ts           # calculateCurrentStreak
│   └── validators.ts        # isValidHabitName
└── types/
    ├── auth.ts              # User, Session types
    └── habit.ts             # Habit type

tests/
├── setup.ts                 # Vitest global setup (jest-dom matchers)
├── unit/                    # Pure function tests (Vitest)
├── integration/             # Component tests (Vitest + RTL)
└── e2e/                     # Full app tests (Playwright)

public/
├── sw.js                    # Service worker
├── manifest.json            # PWA manifest
└── icons/                   # App icons (192×192, 512×512)
```
