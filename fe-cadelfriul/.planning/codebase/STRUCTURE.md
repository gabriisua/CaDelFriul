# Codebase Structure

**Analysis Date:** 2026-07-08

## Directory Layout

```
fe-cadelfriul/
├── .planning/           # GSD planning & codebase analysis artifacts
│   └── codebase/        # Codebase mapping documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
├── .idea/               # JetBrains IDE settings (git-committed)
├── .next/               # Next.js build output (gitignored)
├── node_modules/        # Dependencies (gitignored)
├── public/              # Static assets served at root URL
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   └── app/             # Next.js App Router — all routes live here
│       ├── favicon.ico
│       ├── globals.css   # Tailwind CSS v4 base + design tokens
│       ├── layout.tsx    # Root layout (HTML shell, fonts, metadata)
│       └── page.tsx      # Home page (route: /)
├── AGENTS.md            # Agent instructions (Next.js breaking changes note)
├── CLAUDE.md            # Claude agent config (references AGENTS.md)
├── README.md            # Project README (create-next-app default)
├── eslint.config.mjs    # ESLint 9 flat config
├── next-env.d.ts        # Next.js TypeScript references (auto-generated, do not edit)
├── next.config.ts       # Next.js config (React Compiler enabled)
├── package-lock.json    # Dependency lockfile (committed)
├── package.json         # Project manifest, scripts, dependencies
├── postcss.config.mjs   # PostCSS config (Tailwind CSS v4 plugin)
└── tsconfig.json        # TypeScript config (@/* → src/* alias)
```

## Directory Purposes

**`src/app/`:**
- Purpose: All application routes, layouts, and page components
- Contains: `page.tsx` (routes), `layout.tsx` (wrappers), `globals.css` (global styles)
- Key files:
  - `src/app/layout.tsx` — Root HTML shell, font loading, metadata
  - `src/app/page.tsx` — Home page at `/`
  - `src/app/globals.css` — Global styles and Tailwind `@theme` tokens

**`public/`:**
- Purpose: Static assets served directly at the root URL (`/next.svg`, etc.)
- Contains: SVG icons (Next.js, Vercel, generic icons)
- Key notes: Files here are not processed by webpack; use `next/image` or `<img>` with `/filename.svg` paths

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Committed: No (in `.gitignore`)
- Generated: Yes (by `npm install`)

**`.next/`:**
- Purpose: Build output and dev artifacts
- Committed: No (in `.gitignore`)
- Generated: Yes (by `next dev` / `next build`)

**`.planning/`:**
- Purpose: GSD planning documents, codebase maps, and implementation plans
- Committed: Yes
- Contains: `.planning/codebase/` with per-focus analysis docs

## Key File Locations

### Entry Points
- `src/app/page.tsx` — Home page component (`/`)
- `src/app/layout.tsx` — Root layout (wraps all routes)

### Configuration
- `next.config.ts` — Next.js runtime config (React Compiler, etc.)
- `tsconfig.json` — TypeScript config (`@/*` path alias)
- `postcss.config.mjs` — PostCSS with `@tailwindcss/postcss` plugin
- `eslint.config.mjs` — ESLint 9 flat config (core-web-vitals + TypeScript presets)
- `package.json` — Dependencies, scripts

### Core Logic
- `src/app/globals.css` — Tailwind v4 `@import "tailwindcss"`, CSS custom properties, `@theme inline` block
- `src/app/layout.tsx` — Font setup (`Geist`, `Geist_Mono`), metadata export, HTML structure
- `src/app/page.tsx` — Landing page UI (SVG logos, CTAs, links)

### Testing
- Not yet present — no testing framework installed or test files created

## Naming Conventions

**Files:**
- `*.ts` — Pure TypeScript modules (not yet used)
- `*.tsx` — React components (inside `src/app/`)
- `*.mjs` — ESM config files (root level: `postcss.config.mjs`, `eslint.config.mjs`)
- `*.css` — Stylesheets (`globals.css`)

**Directories:**
- Route segments use lowercase kebab-case convention by Next.js convention (`src/app/` — no custom directories yet)
- `src/app/` directories become URL segments (add `page.tsx` inside a subdirectory to create `/subdir/`)

**Exports:**
- Page components: `export default function ComponentName()` — default export required for routes
- Metadata: `export const metadata: Metadata = { ... }` — named export in `layout.tsx`
- Font configs: `const fontName = FontName({ ... })` — camelCase variable for font instances

## Where to Add New Code

**New Route (Page):**
- Create: `src/app/<route-name>/page.tsx`
- Example: `src/app/about/page.tsx` → `/about`
- Export a default React component

**New Layout (Wrap Sub-route):**
- Create: `src/app/<route-name>/layout.tsx`
- Receives `{ children }: { children: React.ReactNode }`
- Nests inside the parent layout

**New Component (Shared):**
- Create: `src/components/ComponentName.tsx`
- Use the `@/components/ComponentName` import alias
- Place atomics (Button, Card) and composite (Header, Sidebar) here

**New Utility/Helper:**
- Create: `src/lib/helperName.ts`
- Use the `@/lib/helperName` import alias
- Place pure logic, API clients, types, constants

**New API Route (Backend):**
- Create: `src/app/api/<endpoint>/route.ts`
- Export `GET`, `POST`, etc. named functions
- Not yet present — scaffold when needed

**New Styles:**
- Add to `src/app/globals.css` for global tokens via `@theme inline`
- Use Tailwind utility classes directly in JSX
- Add component-scoped CSS via `*.module.css` files co-located with components when needed

**New Static Assets:**
- Place in `public/` — accessible at `/<filename>` from the browser

**Tests:**
- When adding a test framework, place test files co-located with source files as `*.test.ts` or `*.test.tsx`
- Or use `__tests__/` directories for integration tests

## Special Directories

**`.next/`:**
- Purpose: Build output, cached types, dev server artifacts
- Generated: Yes (by `next dev` / `next build`)
- Committed: No

**`node_modules/`:**
- Purpose: Installed packages
- Generated: Yes (by `npm install`)
- Committed: No

**`public/`:**
- Purpose: Unprocessed static assets
- Generated: No (hand-created SVGs)
- Committed: Yes

---

*Structure analysis: 2026-07-08*
