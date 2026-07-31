# Technology Stack

**Project:** Ca' Del Friul — Hybrid Resort Booking & E-commerce Frontend
**Researched:** 2026-07-08
**Overall Confidence:** HIGH

---

## Basis

This stack is opinionated for a **single-developer** project consuming a Spring Boot REST API (JWT auth). The backend handles all auth issuance, payment processing, and domain logic. The frontend is a presentation layer with client-side cart/booking state.

**Existing (already in `package.json`):**
- Next.js 16.2.10, React 19.2.4, TypeScript ^5, Tailwind CSS ^4, ESLint ^9
- React Compiler enabled via `babel-plugin-react-compiler`

**Key constraint:** "JWT Bearer tokens — no NextAuth or similar" (per PROJECT.md)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.10 | React metaframework (App Router) | Already installed. App Router is the only path forward — Pages Router is maintenance-only. Turbopack is the default bundler. |
| React | 19.2.4 | UI library | Already installed. React 19 provides `useActionState`, `useOptimistic`, Server Actions, and the React Compiler. |
| TypeScript | ^5 | Type safety | Already installed. Strict mode enabled. |
| Tailwind CSS | ^4 | Utility-first styling | Already installed. Tailwind v4 uses CSS-first `@theme` directives instead of `tailwind.config.js`. |

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | ^5 | Client-side global state (cart, booking flow, UI state) | The consensus 2026 choice for Next.js App Router. 1KB bundle, no Provider wrapper, selector-based subscriptions prevent re-render issues. Works outside React (useful for API interceptors). **Do NOT use Redux** — it's overkill for a single-developer project and the Provider requirement clashes with App Router's server/client boundary. |
| **TanStack Query** | ^5 | Server state (API data caching, mutations, optimistic updates) | Handles all Spring Boot API communication with automatic caching, background refetching, retries, and cache invalidation. Server Components handle initial page data; TanStack Query manages client-side mutations (cart add, booking create, profile update). |

**Decision rationale:**

Zustand for client state + TanStack Query for server state is the 2026 standard pattern for Next.js commerce apps (confirmed by multiple sources). Zustand's `persist` middleware handles cart persistence to localStorage. TanStack Query provides the `useMutation` pattern for booking/cart operations with optimistic UI.

### Authentication (JWT without NextAuth)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **jose** | ^5 | JWT signing, verification, and decoding on the server | Next.js docs explicitly recommend jose for Edge/Node.js runtime. Used in the DAL (Data Access Layer) to verify JWT tokens from cookies. Edge-compatible. |
| **server-only** | ^1 | Enforce server-only code | Prevents accidental client-side import of auth logic. |

**Auth Architecture (Constraint: no NextAuth, Spring Boot issues JWT):**

```
Login flow:
1. User submits credentials via form → Server Action
2. Server Action POSTs to Spring Boot `/api/auth/login`
3. Spring Boot returns `{ accessToken, refreshToken, user }`
4. Store JWT in httpOnly cookie via Next.js `cookies()` API (using jose to encrypt)
5. Server Action redirects to dashboard

Every subsequent request:
- Server Component: verifySession() reads cookie, decrypts JWT, attaches Bearer header to Spring Boot API calls
- Client Component: TanStack Query reads the authorization header from a thin fetch wrapper that reads the cookie

Protection:
- proxy.ts (Next.js 16 replacement for middleware.ts) — optimistic route protection (cookie check only, no DB call)
- DAL (Data Access Layer) — secure checks in Server Components and Server Actions
```

**CRITICAL: proxy.ts, NOT middleware.ts**

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The exported function is `proxy()`, not `middleware()`. The runtime defaults to Node.js (not Edge). Use `proxy.ts` only for optimistic routing checks — never as a security boundary.

### HTTP / API Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **ky** | ^1 | Lightweight HTTP client for Spring Boot API | Native `fetch` wrapper with a clean API, retry support, and 2KB size. Preferred over axios because: (a) works natively with Next.js Server Components, (b) no need for an interceptor library since TanStack Query handles caching, (c) smaller bundle. **Do NOT use axios** — it adds 14KB for features TanStack Query already provides. |
| TanStack Query (listed above) | ^5 | API data orchestration | Ky handles the raw HTTP; TanStack Query manages caching, deduplication, and invalidation. |

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Hook Form** | ^7 | Performant form state management | Uncontrolled inputs via refs minimize re-renders. Works with shadcn/ui's Form component. Industry standard for 2026. |
| **Zod** | ^3 | Schema declaration & validation | TypeScript-first, type inference via `z.infer`. Validates on both client (RHF resolver) and server (Server Action). Next.js docs explicitly recommend Zod. |
| **@hookform/resolvers** | ^3 | Bridge between RHF and Zod | `zodResolver(schema)` connects RHF to Zod seamlessly. |

**Do NOT use Formik** — it uses controlled inputs causing excessive re-renders, has a larger bundle, and weaker TypeScript integration.

### Date & Time Handling (Booking Critical)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **date-fns** | ^4 | Date manipulation and formatting | Tree-shakeable, immutable, functional. Far smaller than Moment.js or Day.js.  **Do NOT use Moment.js** (deprecated, mutable, huge bundle) or **Day.js** (smaller but less TypeScript integration with date-fns ecosystem). |
| **react-day-picker** | ^9 | Calendar/date picker UI | The default date picker for shadcn/ui's Calendar component. Lightweight, accessible, supports range selection for booking. |
| **shadcn/ui DatePicker** | latest | DatePicker component | Builds on react-day-picker + Popover for a polished UX. Supports date range (check-in / check-out). |

### UI Component System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **shadcn/ui** | latest (CLI) | Component primitives | NOT a dependency — copy-paste components into the project. Fully customizable, Tailwind v4 compatible with `@theme` directives. Provides Calendar, Popover, Dialog, Sheet (slide-out cart), Form, Command, etc. |
| **lucide-react** | ^0.400+ | Icon library | Default icon set for shadcn/ui. Tree-shakeable, consistent design, TypeScript support. |
| **tailwind-merge** | ^3 | Merge Tailwind classes without conflicts | Used by shadcn/ui's `cn()` utility to resolve class conflicts. |
| **clsx** | ^2 | Conditional class names | Standard for conditionally applying classes. |
| **class-variance-authority** | ^0.7 | Component variant management | Used by shadcn/ui for defining component variants (size, color, etc.). |
| **tw-animate-css** | latest | Tailwind v4 animation utilities | Required for shadcn/ui animations with Tailwind v4. |

### Image Handling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **next/image** | built-in | Optimized image component | Lazy loading, responsive images, WebP/AVIF conversion. Use for all resort photography and product images. |
| **sharp** | ^0.33 | Image optimization (production) | Required by Next.js for production image optimization. Install as dev dependency. |

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vitest** | ^3 | Unit testing | Faster than Jest (esbuild-based). Next.js docs provide explicit setup guide. Integrates with React Testing Library. |
| **@testing-library/react** | ^16 | Component testing | The standard for React component testing. Works with Vitest. |
| **@testing-library/dom** | ^10 | DOM testing utilities | Required by React Testing Library. |
| **jsdom** | ^25 | DOM environment for tests | Simulates browser environment in Node. |
| **vite-tsconfig-paths** | ^5 | Path alias resolution for Vitest | Enables `@/` imports in tests. |
| **Playwright** | ^1 | E2E testing | Industry standard. Next.js docs provide setup guide. Tests critical booking flows end-to-end. |

### Development Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Turbopack** | built-in (Next.js 16) | Development bundler | Next.js 16 defaults to Turbopack for `next dev`. 10x faster than webpack. No configuration needed. |
| **Prettier** | ^3 | Code formatting | Consistent code style across the project. Install with `prettier-plugin-tailwindcss` for automatic Tailwind class sorting. |
| **prettier-plugin-tailwindcss** | ^0.6 | Tailwind class sorting | Automatically orders Tailwind classes consistently. |

---

## Installation

```bash
# Client state & server data
npm install zustand @tanstack/react-query @tanstack/react-query-devtools

# HTTP client
npm install ky

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Auth
npm install jose server-only

# Date handling
npm install date-fns react-day-picker

# Icons
npm install lucide-react

# UI utilities (used by shadcn/ui)
npm install tailwind-merge clsx class-variance-authority

# Dev dependencies
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
npm install -D @playwright/test
npm install -D prettier prettier-plugin-tailwindcss
npm install -D sharp # production image optimization

# Initialize shadcn/ui (run once)
npx shadcn@latest init

# Add initial shadcn components
npx shadcn@latest add button card form input label calendar popover select dialog sheet sonner separator badge sheet
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| State management | Zustand + TanStack Query | Redux Toolkit | Overkill for single-dev project. Provider requirement clashes with App Router. RTK Query duplicates TanStack Query. |
| HTTP client | ky | axios | 14KB extra for features TanStack Query already provides. ky is 2KB, native fetch wrapper. |
| Forms | React Hook Form + Zod | Formik | Formik uses controlled inputs (more re-renders), weaker TypeScript, larger ecosystem dependency. |
| Date library | date-fns | Day.js / Moment.js | Moment.js is deprecated (mutable, 230KB). Day.js has weaker TypeScript and smaller ecosystem for date-fns utilities like `differenceInCalendarDays`. |
| Auth | Custom (jose + DAL) | NextAuth.js | Project constraint forbids NextAuth. Custom JWT is straightforward since Spring Boot handles token issuance and validation. |
| UI framework | shadcn/ui (unstyled components) | MUI, Ant Design, Chakra | Full component libraries require Provider wrappers, are hard to theme to "luxury rustic-chic" brand, and ship 100KB+ of CSS. shadcn/ui gives full control. |
| Testing | Vitest | Jest | Vitest is faster, uses the same API, and has better ESM support. Next.js 16 docs provide Vitest setup guide. |
| E2E | Playwright | Cypress | Playwright is faster, has better API, and tests directly on browser APIs. Next.js docs provide Playwright setup. |

---

## Why NOT These Technologies

| Technology | Reason |
|-----------|--------|
| **Redux / Redux Toolkit** | Requires `<Provider>` wrapper — problematic with App Router's server/client boundary. 12KB+ bundle. Ceremony for a single-dev project. Zustand covers the same needs in 1KB with zero providers. |
| **NextAuth.js (Auth.js)** | Project constraint: "JWT Bearer tokens — no NextAuth or similar." Backend handles auth. Frontend just stores and sends tokens. |
| **tRPC** | Backend is Spring Boot (REST API), not Node.js. tRPC requires full-stack TypeScript. |
| **SWR** | Less feature-rich than TanStack Query v5. No first-class optimistic updates, no `useMutation` pattern, weaker cache invalidation. |
| **GraphQL (Apollo/Urql)** | Backend exposes REST API. Adding a GraphQL layer between the frontend and Spring Boot adds needless complexity. |
| **Tailwind v3** | Already on v4. v4 has CSS-first config (`@theme`), better performance, and OKLCH color support. shadcn/ui fully supports v4. |
| **CSS Modules / CSS-in-JS** | Project constraint: "Tailwind CSS only — no CSS-in-JS or CSS Modules." |
| **Zustand v4** | v5 has improved TypeScript, simpler API. Use v5. |

---

## Architecture Notes

### File Structure Additions (beyond existing scaffold)

```
src/
  lib/
    api-client.ts          # ky instance preconfigured with base URL
    queries/               # TanStack Query key factories + hooks
      products.ts
      bookings.ts
      auth.ts
      experiences.ts
    stores/                # Zustand stores
      cart-store.ts        # Cart state (persisted to localStorage)
      booking-store.ts     # Booking flow state (date range, guests, etc.)
      ui-store.ts          # UI state (sidebar open, modals, etc.)
    session.ts             # jose encryption/decryption for JWT cookies
    dal.ts                 # Data Access Layer (verifySession, getUser)
    definitions.ts         # Zod schemas shared between client and server
    utils.ts               # cn() utility using tailwind-merge
  app/
    proxy.ts               # Optimistic route protection (NOT middleware.ts)
    (auth)/                # Login/register layout
    (dashboard)/           # Authenticated routes
    (vetrina)/             # Public showcase (marketing)
  components/
    ui/                    # shadcn/ui components (copied by CLI)
    forms/                 # Form components using RHF + Zod
    booking/               # Booking-specific components
  hooks/                   # Custom hooks
```

### Data Flow Summary

```
Server Components (default in App Router)
  │
  ├── Fetch initial data via native fetch() or ky
  │   → Spring Boot REST API → Server-rendered HTML
  │
  └── Protected data via DAL
      → verifySession() reads httpOnly cookie → decrypts JWT
      → Fetches user-specific data

Client Components ("use client")
  │
  ├── TanStack Query (server state)
  │   → useQuery() → cached API data
  │   → useMutation() → cart updates, booking creation, profile edits
  │   → Optimistic updates for instant UI feedback
  │
  ├── Zustand (client state)
  │   → Cart items (persisted)
  │   → Booking flow (date range, selected room, add-ons)
  │   → UI state (mobile menu, filters)
  │
  └── React Hook Form (form state)
      → Zod validation (client-side via @hookform/resolvers)
      → Server Action or TanStack Query mutation (server-side)

Server Actions (mutations)
  │
  ├── Re-validate form data with Zod
  ├── Check authorization via DAL
  └── POST/PUT/DELETE to Spring Boot API
```

---

## Sources

- **Next.js 16 Auth Guide** — Official docs (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`) [HIGH confidence]
- **Next.js 16 Forms Guide** — Official docs (`node_modules/next/dist/docs/01-app/02-guides/forms.md`) [HIGH confidence]
- **Next.js 16 proxy.ts** — Official file convention docs [HIGH confidence]
- **Next.js 16 Vitest Setup** — Official testing setup [HIGH confidence]
- **shadcn/ui Installation** — `ui.shadcn.com/docs/installation/next` [HIGH confidence]
- **shadcn/ui Tailwind v4** — `ui.shadcn.com/docs/tailwind-v4` [HIGH confidence]
- **Zustand + Next.js App Router (2026)** — Noqta tutorial, multiple WebSearch sources [MEDIUM confidence]
- **TanStack Query v5 with Next.js** — Noqta tutorial [MEDIUM confidence]
- **State Management Comparison 2026** — Multiple dev.to articles, C# Corner, StackNotice [HIGH confidence: consensus across 6+ sources]
- **JWT Auth without NextAuth** — Next.js docs + dev.to guide [HIGH confidence]
- **Styling: Tailwind + Next.js 2026** — DesignRevision guide [MEDIUM confidence]
- **Migrating middleware to proxy.ts** — Next.js official migration docs, dev.to migration guide [HIGH confidence]
