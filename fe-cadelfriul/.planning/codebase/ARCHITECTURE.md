<!-- refreshed: 2026-07-08 -->
# Architecture

**Analysis Date:** 2026-07-08

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (Client)                          │
├──────────────────────────────────────────────────────────────┤
│                     Next.js Server                            │
│                   `next dev` / `next start`                   │
├──────────────────────────────────────────────────────────────┤
│                    App Router (RSC)                           │
│            `src/app/` — file-based routing                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   Root Layout     │   Home Page      │   (Future Routes)     │
│  `src/app/layou│  `src/app/page.tsx`│   `src/app/*/`       │
└──────────────────┴──────────────────┴───────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Tailwind CSS 4                             │
│                `src/app/globals.css`                          │
│              `@theme inline` + utility classes                │
└──────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | HTML shell, font loading (Geist), global CSS import, metadata | `src/app/layout.tsx` |
| Home Page | Landing page content, static demo UI | `src/app/page.tsx` |
| Global Styles | Tailwind base, CSS variables (`@theme inline`), dark mode | `src/app/globals.css` |

## Pattern Overview

**Overall:** Next.js App Router with React Server Components

**Key Characteristics:**
- **File-based routing** — every `page.tsx` inside `src/app/` creates a route segment (`/`, `/about`, `/products/[id]`, etc.)
- **React Server Components (RSC)** — components render on the server by default; `"use client"` directive is needed for client interactivity
- **Layout nesting** — `layout.tsx` files wrap child routes, enabling persistent UI across navigations
- **Static assets** served from `public/` at the root URL (`/next.svg`, etc.)
- **CSS-only styling** via Tailwind utility classes — no CSS-in-JS or CSS Modules present yet
- **React Compiler 19** enabled via `reactCompiler: true` in `next.config.ts` — auto-memoizes components (no manual `useMemo`/`useCallback` needed in most cases)

## Layers

**App Layer (Page Components):**
- Purpose: Define routes, page UI, and layout shells
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico`
- Depends on: Tailwind CSS, Next.js built-ins (`next/font`, `next/image`, `next/link`)
- Used by: Next.js router (automatically)

**Public Layer (Static Assets):**
- Purpose: Serve static files at the root URL path
- Location: `public/`
- Contains: SVG icons (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`)
- Depends on: Nothing
- Used by: Page components via `/filename.svg` paths

**Config Layer (Build / Dev tooling):**
- Purpose: Configure TypeScript, ESLint, PostCSS, and Next.js
- Location: Project root
- Contains: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `package.json`
- Depends on: Nothing (consumed by tooling)
- Used by: Build pipeline, dev server

## Data Flow

### Primary Request Path (Page Load)

1. **HTTP request** → Next.js server matches route segment in `src/app/`
2. Route file (`src/app/page.tsx`) renders as a **React Server Component**
3. `RootLayout` (`src/app/layout.tsx`) wraps the page with the HTML shell, injected fonts (`Geist`, `Geist_Mono`), and `globals.css`
4. **Server returns HTML** to browser (no client JavaScript needed for initial paint)
5. **Client hydration** activates interactive elements (none so far — pure static page)

### Font Loading

1. `Geist` and `Geist_Mono` fetched via `next/font/google` in `src/app/layout.tsx`
2. CSS variables `--font-geist-sans` and `--font-geist-mono` set on `<html>`
3. Tailwind's `@theme inline` in `globals.css` maps variables to `--font-sans` / `--font-mono`
4. Applied via `font-sans` utility class on `<html>`

**State Management:**
- Not yet implemented (fresh project — no state management library included)
- React Compiler auto-memoizes components at build time (`next.config.ts`: `reactCompiler: true`)

## Key Abstractions

**Next.js App Router (File-based Routes):**
- Purpose: Define routes as files; each `page.tsx` in a directory creates a URL segment
- Examples: `src/app/page.tsx` → `/`
- Pattern: Convention over configuration

**Root Layout (`layout.tsx`):**
- Purpose: Persistent UI shell surrounding all routes; defines `<html>`, fonts, and global styles
- File: `src/app/layout.tsx`
- Pattern: Single root layout; child routes can have nested layouts

**Tailwind CSS `@theme inline`:**
- Purpose: Define design tokens (colors, fonts) as CSS variables usable via utility classes
- File: `src/app/globals.css`
- Pattern: CSS variables injected into Tailwind's theme via `@theme inline` directive

## Entry Points

**Development Server:**
- Command: `npm run dev` → `next dev`
- Port: `localhost:3000`
- Hot reload: enabled (changes to `src/app/` are reflected instantly)

**Production Build:**
- Command: `npm run build` → `next build`
- Output: `.next/` directory

**Production Server:**
- Command: `npm run start` → `next start`
- Serves the built application from `.next/`

## Architectural Constraints

- **Server-first rendering:** All components in `src/app/` are React Server Components by default. Client interactivity requires explicit `"use client"` directive.
- **No global state management:** The codebase has no stores (Zustand, Redux, Context), no API layer, no database integration yet.
- **Single root layout:** `src/app/layout.tsx` is the only layout — no nested layouts exist yet.
- **Path alias:** `@/*` maps to `./src/*` (configured in `tsconfig.json`), e.g. `@/app/page` resolves to `src/app/page`.
- **Circular imports:** None present (too early).
- **Global state:** Not applicable — no module-level singletons or shared mutable state.
- **Threading:** Single-threaded Node.js event loop for SSR; browser handles client-side rendering.

## Anti-Patterns

*None observed. The codebase is a fresh scaffold with no custom code written yet.*

## Error Handling

**Strategy:** Not yet implemented. Uses default Next.js error handling (500 page for server errors, 404 for unmatched routes).

**Patterns to follow when implementing:**
- Use `error.tsx` files in route segments for granular error UI
- Use `not-found.tsx` for custom 404 pages

## Cross-Cutting Concerns

**Logging:** Not yet implemented. Use `console` or a logger lib when building.

**Validation:** Not yet implemented. Consider Zod or Valibot for runtime validation when building forms or API routes.

**Authentication:** Not yet implemented. This is a scaffold — auth integration will be needed.

---

*Architecture analysis: 2026-07-08*
