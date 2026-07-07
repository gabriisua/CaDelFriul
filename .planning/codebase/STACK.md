# Technology Stack

**Analysis Date:** 2026-07-06

## Languages

**Primary:**
- Java 26 (toolchain) — Backend API server (`be-cadelfriul/`)
- TypeScript ~5.9 — Angular backoffice app (`bo-cadelfriul/`)
- TypeScript ^5 — Next.js frontend app (`fe-cadelfriul/`)

**Secondary:**
- HTML/CSS — Angular/React component templates and global styles

## Runtime

**Environments:**
- JVM (Java 26) — Backend Spring Boot server (`be-cadelfriul/`)
- Node.js (via npm 11.10.0) — Backoffice SSR (`bo-cadelfriul/`)
- Node.js — Frontend Next.js server (`fe-cadelfriul/`)

**Package Managers:**
- Gradle 9.6.0 (Kotlin DSL) — Backend (`be-cadelfriul/build.gradle.kts`, `be-cadelfriul/settings.gradle.kts`)
- npm 11.10.0 — Backoffice (`bo-cadelfriul/package-lock.json`)
- npm — Frontend (`fe-cadelfriul/package-lock.json`)
- Lockfiles: present for all three sub-projects

## Frameworks

**Core Backend:**
- Spring Boot 4.1.0 — REST API framework (`org.springframework.boot`)
  - `spring-boot-starter-webmvc` — MVC web layer
  - `spring-boot-starter-data-jpa` — JPA/Hibernate ORM
  - `spring-boot-starter-security` — Authentication & authorization

**Core Backoffice:**
- Angular 21.2.0 — SPA framework, standalone components (no NgModules)
  - `@angular/router` — Client-side routing
  - `@angular/ssr` + `@angular/platform-server` — Server-side rendering
  - `express` 5.1.0 — SSR Express server

**Core Frontend:**
- React 19.2.4 — UI library
- Next.js 16.2.10 — React meta-framework with App Router
  - `eslint-config-next` 16.2.10 — Next.js-specific lint rules
  - `babel-plugin-react-compiler` 1.0.0 — React Compiler for automatic memoization

**Testing:**
- JUnit 5 + `junit-platform-launcher` — Backend tests (`be-cadelfriul/`)
- Vitest 4.0.8 — Backoffice unit tests (`bo-cadelfriul/`)
  - Config: `tsconfig.spec.json` uses `vitest/globals` types
  - Runner: `@angular/build:unit-test` via Angular CLI

**Build/Dev:**
- Gradle Wrapper 9.6.0 — Backend build (`be-cadelfriul/gradlew`)
- Angular CLI 21.2.8 — Backoffice build (`@angular/cli`, `@angular/build`)
- Next.js built-in — Frontend build (`next build` / `next dev`)
- ESLint 9 — Frontend linting (`eslint.config.mjs`)
- Prettier 3.8.1 — Backoffice code formatting (`.prettierrc`)
- PostCSS 8.5.3 + `@tailwindcss/postcss` — CSS processing in both frontend projects

## Key Dependencies

**Critical:**
- `org.postgresql:postgresql` — PostgreSQL JDBC driver (backed runtime dependency)
- `springdoc-openapi-starter-webmvc-ui` 2.6.0 — Swagger/OpenAPI documentation UI (`be-cadelfriul/src/main/java/com/cadelfriul/backend/core/config/OpenApiConfig.java`)
- `@angular/ssr` 21.2.8 — Angular SSR engine with Express (`bo-cadelfriul/src/server.ts`)
- `@tailwindcss/postcss` ^4 — Tailwind CSS v4 PostCSS plugin (both frontends)
- `react-compiler` 1.0.0 — Next.js `reactCompiler: true` in `next.config.ts`

**Infrastructure:**
- `@angular/build` 21.2.8 — Angular application builder (Vite-based)
- `jsdom` 28.0.0 — DOM environment for Vitest tests

## Configuration

**Environment:**
- `be-cadelfriul/src/main/resources/application.properties` — Spring Boot config:
  - PostgreSQL connection: `jdbc:postgresql://localhost:5432/cadelfriul_db`
  - Hibernate ddl-auto: `update` (auto schema management)
  - Server port: `8080`
- `.gitignore` excludes `.env` and `.env*.local` files (present but no committed `.env` file detected)
- `bo-cadelfriul/src/server.ts` uses `process.env['PORT']` (default 4000) and `process.env['pm_id']`
- No `.env.example` files detected

**Build Configuration Files:**
| File | Purpose |
|------|---------|
| `be-cadelfriul/build.gradle.kts` | Gradle build definition with Spring Boot plugin |
| `be-cadelfriul/settings.gradle.kts` | Project name (`be-cadelfriul`) |
| `be-cadelfriul/gradle/wrapper/gradle-wrapper.properties` | Gradle 9.6.0 wrapper config |
| `bo-cadelfriul/angular.json` | Angular project build/serve/test config |
| `bo-cadelfriul/tsconfig.json` | TypeScript config (references `tsconfig.app.json`, `tsconfig.spec.json`) |
| `bo-cadelfriul/.postcssrc.json` | PostCSS with Tailwind CSS plugin |
| `bo-cadelfriul/.prettierrc` | Prettier: 100 print width, single quotes, Angular HTML parser |
| `fe-cadelfriul/next.config.ts` | Next.js: React Compiler enabled |
| `fe-cadelfriul/tsconfig.json` | TypeScript: `@/*` → `./src/*` path alias, ES2017 target |
| `fe-cadelfriul/eslint.config.mjs` | ESLint flat config: Next.js core-web-vitals + TypeScript |
| `fe-cadelfriul/postcss.config.mjs` | PostCSS with Tailwind CSS plugin |

## Platform Requirements

**Development:**
- JDK 26 (Java toolchain)
- Node.js (npm for dependency installs)
- PostgreSQL server running on `localhost:5432`
- Gradle wrapper (auto-downloads Gradle 9.6.0)

**Production:**
- Not yet configured — no Docker, Docker Compose, CI/CD pipeline, or deployment config files detected
- Deployment targets hinted in `bo-cadelfriul/src/server.ts`: "Firebase Cloud Functions" (comment reference)

---

*Stack analysis: 2026-07-06*
