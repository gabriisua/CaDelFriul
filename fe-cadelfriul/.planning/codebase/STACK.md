# Technology Stack

**Analysis Date:** 2026-07-08

## Languages

**Primary:**
- TypeScript ^5 - All application source code (`src/`)
- CSS 3 (with Tailwind directives) - Global styles (`src/app/globals.css`)

**Secondary:**
- JavaScript (ESNext) - Build configuration files (`next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`)

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` found)

**Package Manager:**
- npm (default for Next.js)
- Lockfile: `package-lock.json` (present)
- No `yarn.lock` or `pnpm-lock.yaml` detected

## Frameworks

**Core:**
- **Next.js** 16.2.10 — React metaframework (App Router)
- **React** 19.2.4 — UI component library
- **React DOM** 19.2.4 — DOM renderer for React

**Styling:**
- **Tailwind CSS** ^4 — Utility-first CSS framework
- **@tailwindcss/postcss** ^4 — PostCSS plugin for Tailwind v4

**Testing:**
- Not detected — no test framework installed (no `vitest`, `jest`, or `playwright` in `package.json`)

**Build/Dev:**
- **Next.js built-in compiler** — Production build via `next build`, dev via `next dev`
- **React Compiler** (babel-plugin-react-compiler 1.0.0) — Enabled via `reactCompiler: true` in `next.config.ts`
- **PostCSS** — CSS transformation pipeline (`postcss.config.mjs`)
- **TypeScript** ^5 — Type checking via `tsc` (noEmit mode, bundler module resolution)

## Key Dependencies

**Critical:**
- `next@16.2.10` — Entire framework, routing, SSR, build tooling
- `react@19.2.4` + `react-dom@19.2.4` — UI rendering foundation

**Infrastructure:**
- `typescript@^5` — Type safety and language service
- `tailwindcss@^4` — All styling via utility classes
- `eslint@^9` + `eslint-config-next@16.2.10` — Linting with Next.js core-web-vitals and TypeScript rulesets

## Configuration

**Environment:**
- No `.env` files detected (`.env*` gitignored — see `.gitignore` line 34)
- No `.env.example` provided

**Build:**
- `next.config.ts` — Next.js configuration (React Compiler enabled, no other custom config)
- `tsconfig.json` — TypeScript config with `@/*` → `./src/*` path alias
- `postcss.config.mjs` — PostCSS with `@tailwindcss/postcss` plugin only
- `eslint.config.mjs` — Flat config using `eslint-config-next` core-web-vitals + TypeScript rulesets

## Platform Requirements

**Development:**
- Node.js (version unspecified)
- npm (for dependency installation)

**Production:**
- Node.js runtime compatible with Next.js 16.2.10
- Deployable to any Node.js hosting (Vercel recommended)

---

*Stack analysis: 2026-07-08*
