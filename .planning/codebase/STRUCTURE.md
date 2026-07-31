# Codebase Structure

**Analysis Date:** 2026-07-06

## Directory Layout

```
CaDelFriul/
├── .gitignore                 # Shared gitignore (node, gradle, IDE, build artifacts)
├── RoadmapCaDelFriul.pdf      # Project roadmap document
├── .planning/                 # GSD planning artifacts
│   └── codebase/              # Codebase analysis documents (generated)
│
├── be-cadelfriul/             # BACKEND — Spring Boot REST API (Java 26, Gradle)
│   ├── build.gradle.kts       # Gradle build: Spring Boot 4.1, JPA, Security, PostgreSQL
│   ├── settings.gradle.kts    # rootProject.name = "be-cadelfriul"
│   ├── gradlew / gradlew.bat  # Gradle wrapper scripts
│   ├── gradle/                # Gradle wrapper distributions
│   └── src/
│       ├── main/
│       │   ├── java/com/cadelfriul/backend/
│       │   │   ├── BeCadelfriulApplication.java   # Spring Boot entry point
│       │   │   ├── core/                           # Cross-cutting concerns
│       │   │   │   ├── auth/                       # Admin auth module (entities only)
│       │   │   │   │   ├── entity/                 # JPA entities
│       │   │   │   │   ├── repository/             # (empty)
│       │   │   │   │   ├── service/                # (empty)
│       │   │   │   │   ├── controller/             # (empty)
│       │   │   │   │   └── dto/                    # (empty)
│       │   │   │   └── config/                     # Spring configuration classes
│       │   │   │       ├── OpenApiConfig.java      # Swagger/OpenAPI docs
│       │   │   │       └── SecurityConfig.java     # Security filter chain (dev mode)
│       │   │   ├── ebike/                          # (empty — planned module)
│       │   │   ├── ecommerce/                      # (empty — planned module)
│       │   │   ├── hospitality/                    # (empty — planned module)
│       │   │   └── wellness/                       # (empty — planned module)
│       │   └── resources/
│       │       ├── application.properties          # DB, server, JPA config
│       │       ├── static/                         # (empty)
│       │       └── templates/                      # (empty)
│       └── test/
│           └── java/com/cadelfriul/backend/
│               └── BeCadelfriulApplicationTests.java  # Spring context load test
│
├── bo-cadelfriul/             # BACKOFFICE — Angular 21 standalone + SSR (TypeScript)
│   ├── angular.json           # Angular CLI config (SSR, Tailwind, Vitest)
│   ├── tsconfig.json          # TypeScript config (strict, ES2022)
│   ├── tsconfig.app.json      # App-specific TS config
│   ├── tsconfig.spec.json     # Test-specific TS config
│   ├── package.json           # Angular 21, SSR, Express, Tailwind, Vitest
│   ├── package-lock.json
│   ├── .editorconfig          # Editor settings (2 spaces, utf-8)
│   ├── .prettierrc            # Prettier: 100 width, single quotes, angular parser for HTML
│   ├── .postcssrc.json        # PostCSS: Tailwind plugin only
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── index.html          # Main HTML shell (<app-root>)
│       ├── main.ts             # Browser bootstrap entry
│       ├── main.server.ts      # SSR bootstrap entry
│       ├── server.ts           # Express SSR server (port 4000)
│       ├── styles.css          # Global styles (@import 'tailwindcss')
│       └── app/
│           ├── app.ts          # Root standalone component
│           ├── app.html        # Root component template (Angular default)
│           ├── app.css         # Root component styles (empty)
│           ├── app.config.ts   # App config (router, hydration, error listeners)
│           ├── app.config.server.ts  # Server-specific config merge
│           ├── app.routes.ts   # Routes (empty array — no routes defined)
│           ├── app.routes.server.ts  # Server route rendering modes (prerender all)
│           └── app.spec.ts     # Smoke test for App component
│
└── fe-cadelfriul/             # FRONTEND — Next.js 16 App Router + React 19 (TypeScript)
    ├── next.config.ts          # Next.js config (React Compiler enabled)
    ├── tsconfig.json           # TypeScript config (strict, path alias @/*)
    ├── package.json            # Next 16, React 19, Tailwind v4, ESLint
    ├── package-lock.json
    ├── eslint.config.mjs       # ESLint: next/core-web-vitals + typescript configs
    ├── postcss.config.mjs      # PostCSS: Tailwind plugin only
    ├── AGENTS.md               # Next.js agent rules (breaking changes notice)
    ├── CLAUDE.md               # Points to AGENTS.md
    ├── public/
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    └── src/
        └── app/
            ├── layout.tsx      # Root layout (Geist fonts, Tailwind, dark mode)
            ├── page.tsx        # Home page (starter template)
            ├── globals.css     # Global styles (@import "tailwindcss", CSS variables)
            └── favicon.ico
```

## Directory Purposes

**`be-cadelfriul/` (Backend):**
- Purpose: Spring Boot REST API server — business logic, data persistence, authentication
- Contains: Java source files, Gradle build config, SQL init scripts
- Key files:
  - `build.gradle.kts`: Dependencies (Spring Boot 4.1, JPA, Security, OpenAPI, PostgreSQL)
  - `src/main/resources/application.properties`: Database URL, JPA settings, server port
- Base package: `com.cadelfriul.backend`

**`bo-cadelfriul/` (Backoffice):**
- Purpose: Angular-based admin management panel
- Contains: TypeScript/HTML components, Angular config, Express server
- Key files:
  - `angular.json`: Build config (SSR enabled, Vitest test runner)
  - `src/main.ts`: Browser bootstrap
  - `src/server.ts`: Express SSR server
- Port: 4000 (dev)
- Testing: Vitest (not Karma)

**`fe-cadelfriul/` (Frontend):**
- Purpose: Public-facing customer website
- Contains: Next.js App Router pages, layouts, global styles
- Key files:
  - `next.config.ts`: React Compiler enabled
  - `src/app/layout.tsx`: Root layout with Geist fonts
  - `src/app/page.tsx`: Home page
- Path alias: `@/*` maps to `./src/*`
- Testing: None detected

## Key File Locations

**Entry Points:**
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java`: Spring Boot main class
- `bo-cadelfriul/src/main.ts`: Angular browser bootstrap
- `bo-cadelfriul/src/server.ts`: Angular SSR Express server
- `fe-cadelfriul/src/app/layout.tsx`: Next.js root layout

**Configuration:**
- `be-cadelfriul/build.gradle.kts`: Java dependencies, Spring Boot plugin
- `be-cadelfriul/src/main/resources/application.properties`: Database, server, JPA
- `bo-cadelfriul/angular.json`: Angular build, serve, test config
- `bo-cadelfriul/tsconfig.json`: TypeScript strict mode, ES2022
- `fe-cadelfriul/next.config.ts`: Next.js features (React Compiler)
- `fe-cadelfriul/tsconfig.json`: TypeScript strict, path alias `@/*`
- `fe-cadelfriul/eslint.config.mjs`: ESLint rules (Next.js core-web-vitals + TS)

**Core Logic:**
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/Admin.java`: Admin JPA entity (only entity with business logic)
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/AdminLog.java`: Audit log entity
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/AdminRole.java`: Enum (SUPER_ADMIN, RECEPTIONIST)
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java`: Spring Security filter chain
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/config/OpenApiConfig.java`: Swagger OpenAPI bean

**Testing:**
- `be-cadelfriul/src/test/java/com/cadelfriul/backend/BeCadelfriulApplicationTests.java`: Spring context load test
- `bo-cadelfriul/src/app/app.spec.ts`: Angular smoke test for App component

## Naming Conventions

**Files:**
- Backend (Java): PascalCase domain classes (`Admin.java`, `AdminLog.java`), PascalCase config (`SecurityConfig.java`)
- Backoffice (Angular): kebab-case component files (`app.config.ts`, `app.routes.ts`), PascalCase classes
- Frontend (Next.js): kebab-case files (`layout.tsx`, `page.tsx`, `globals.css`), Next.js convention (`page.tsx`, `layout.tsx`)

**Directories:**
- Backend: `snake_case/` (com.cadelfriul.backend.core.auth), flat package structure per domain module
- Backoffice: `kebab-case/` for app directory (Angular default)
- Frontend: `kebab-case/` (App Router convention)
- Backend domain modules: lowercase single-word (`ebike/`, `ecommerce/`, `wellness/`, `hospitality/`)

**Code:**
- Backend: Java conventions — PascalCase classes, camelCase methods/fields (`getEmail()`, `setPassword()`), UPPER_CASE enums
- Backoffice: Angular conventions — camelCase properties/methods, PascalCase classes/components
- Frontend: React/Next.js conventions — PascalCase components, camelCase functions/variables

## Where to Add New Code

**New Feature (Backend):**
- Create domain module under `be-cadelfriul/src/main/java/com/cadelfriul/backend/{domain}/`
- Structure: `entity/`, `repository/`, `service/`, `controller/`, `dto/`
- Example: `com.cadelfriul.backend.ebike.entity.EBike`
- Tests: `be-cadelfriul/src/test/java/com/cadelfriul/backend/{domain}/`

**New Feature (Backoffice):**
- Create component in `bo-cadelfriul/src/app/{feature-name}/`
- Register route in `bo-cadelfriul/src/app/app.routes.ts`
- Tests: co-located `*.spec.ts` files
- Server routes: update `bo-cadelfriul/src/app/app.routes.server.ts`

**New Feature (Frontend):**
- Create page under `fe-cadelfriul/src/app/{route}/page.tsx` (App Router convention)
- Shared components: `fe-cadelfriul/src/app/components/` or `fe-cadelfriul/src/components/`
- Shared utilities: `fe-cadelfriul/src/lib/` or `fe-cadelfriul/src/app/lib/`
- API client: `fe-cadelfriul/src/lib/api.ts` or similar

**New API endpoint (Backend):**
- Add `@RestController` class in `controller/` package of the relevant domain
- Add DTOs in `dto/` package
- Add service class in `service/` package with `@Service`
- Add repository interface extending `JpaRepository` in `repository/` package

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD-generated architecture/planning analysis documents
- Generated: Yes (by `/gsd-map-codebase`)
- Committed: Yes (shared context for agents)

**`node_modules/` (in bo-cadelfriul and fe-cadelfriul):**
- Purpose: Node.js dependencies
- Generated: Yes (npm install)
- Committed: No (gitignored)

**`build/` (in be-cadelfriul):**
- Purpose: Gradle build output
- Generated: Yes
- Committed: No (gitignored)

**`.next/` (in fe-cadelfriul):**
- Purpose: Next.js build cache and output
- Generated: Yes
- Committed: No (gitignored)

---

*Structure analysis: 2026-07-06*
