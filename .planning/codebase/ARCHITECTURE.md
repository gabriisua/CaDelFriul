<!-- refreshed: 2026-07-06 -->
# Architecture

**Analysis Date:** 2026-07-06

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      CUSTOMER-FACING (fe-cadelfriul)                 │
│  Next.js 16 App Router · React 19 · Tailwind CSS v4                 │
│  `fe-cadelfriul/src/app/`                                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTP (REST)
┌──────────────────────────────┴──────────────────────────────────────┐
│                      BACKOFFICE (bo-cadelfriul)                     │
│  Angular 21 Standalone · SSR · Tailwind CSS v4                     │
│  `bo-cadelfriul/src/app/`                                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTP (REST)
┌──────────────────────────────┴──────────────────────────────────────┐
│                      API LAYER (be-cadelfriul)                      │
│  Spring Boot 4.1 · Java 26 · Spring Security · SpringDoc OpenAPI    │
│  REST API on :8080                                                   │
│  `com.cadelfriul.backend`                                           │
├─────────────────────────────────────────────────────────────────────┤
│  Domain Modules:                                                     │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────┐               │
│  │  Auth   │ │ Ebike    │ │ Ecommerce │ │ Hospitality │ Wellness │  │
│  │(active) │ │ (todo)   │ │ (todo)    │ │ (todo)      │ (todo)   │  │
│  └─────────┘ └──────────┘ └───────────┘ └─────────────┘ ───────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                      PERSISTENCE LAYER                              │
│  PostgreSQL · JPA/Hibernate · `application.properties`              │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Backend (be) | REST API, business logic, data persistence | `be-cadelfriul/` |
| Backoffice (bo) | Admin panel, management UI (Angular SSR) | `bo-cadelfriul/` |
| Frontend (fe) | Customer-facing public site (Next.js SSR) | `fe-cadelfriul/` |

## Pattern Overview

**Overall:** Multi-frontend monorepo — two standalone SPA/SSR clients (Angular + Next.js) consuming a shared REST backend built with Spring Boot. No shared code or package between frontends.

**Key Characteristics:**
- Each sub-project is fully independent with its own build system, dependencies, and dev server
- No monorepo tooling (Nx, Turborepo, Lerna) — manual coordination
- Backend uses Spring Boot layered architecture (Controller → Service → Repository)
- Backoffice uses Angular 21 standalone components (no NgModules)
- Frontend uses Next.js App Router (file-system routing)
- Both frontends use Tailwind CSS v4 for styling (via PostCSS)
- All three projects use TypeScript-liked/typed languages (Java for BE, TypeScript for BO/FE)

## Layers

### Backend Layer (`be-cadelfriul/src/main/java/com/cadelfriul/backend/`):

- **Purpose:** REST API server
- **Package Pattern:** Per-domain modules with layer sub-packages: `entity/`, `repository/`, `service/`, `controller/`, `dto/`
- **Domains planned:** `core/auth/`, `ebike/`, `ecommerce/`, `hospitality/`, `wellness/`
- **Core cross-cutting:** `core/config/` (SecurityConfig, OpenApiConfig), `core/auth/` (admin authentication)
- **Current state:** Only `core/auth` has entity code. All other domain directories (`ebike/`, `ecommerce/`, `hospitality/`, `wellness/`) are empty directories.

### Backoffice Layer (`bo-cadelfriul/src/`):

- **Purpose:** Admin management application
- **Structure:** Standalone Angular app bootstrapped via `bootstrapApplication(App, appConfig)`
- **Contains:** `main.ts` (browser entry), `main.server.ts` (SSR entry), `server.ts` (Express server)
- **App:** Single `App` component with `RouterOutlet` (`app.ts`, `app.html`, `app.css`)
- **Routes:** Empty `routes: Routes = []` — no routes defined yet
- **Testing:** Vitest (via `@angular/build:unit-test`)

### Frontend Layer (`fe-cadelfriul/src/app/`):

- **Purpose:** Public customer-facing website
- **Structure:** Next.js App Router — `layout.tsx` (root layout with Geist fonts), `page.tsx` (home page)
- **State:** Starter template — only the default Next.js welcome page

## Data Flow

### Primary Request Path (planned)

1. **Client request** → Next.js frontend (`fe-cadelfriul/src/app/page.tsx`) or Angular backoffice (`bo-cadelfriul/src/app/app.ts`)
2. **HTTP request** → Spring Boot REST API (`be-cadelfriul`, port 8080)
3. **Controller** → validates input, calls service layer
4. **Service** → business logic, calls repository
5. **Repository** → JPA/Hibernate → PostgreSQL database
6. **Response** bubbles back up through the layers

### Current Data Flow

1. All three projects are in early development — no actual API calls are wired yet
2. Backend only has JPA entities (`Admin`, `AdminLog`, `AdminRole`) with no controllers or services
3. Backoffice and Frontend display starter templates

**State Management:**
- Backend: Stateless REST (session managed via Spring Security, currently disabled for dev)
- Backoffice: Angular signals (`signal()` in `App.ts`)
- Frontend: No state management yet

## Key Abstractions

**Spring Boot Layered Architecture (planned per domain):**
- Purpose: Standard separation of concerns per domain module
- Pattern: `entity/` → JPA entities, `repository/` → Spring Data repositories, `service/` → business logic, `controller/` → REST endpoints, `dto/` → request/response objects
- Examples: `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/Admin.java`
- Pattern: Spring stereotype annotations (`@Entity`, `@Controller`, `@Service`, `@Repository`, `@Configuration`)

**Angular Standalone Components:**
- Purpose: Modern Angular without NgModules
- Examples: `bo-cadelfriul/src/app/app.ts`
- Pattern: `@Component({ selector, imports, templateUrl, styleUrl })` with `bootstrapApplication`

**Next.js App Router:**
- Purpose: File-system based routing with React Server Components
- Examples: `fe-cadelfriul/src/app/layout.tsx`, `fe-cadelfriul/src/app/page.tsx`
- Pattern: Server Components by default, `"use client"` for interactivity

## Entry Points

| Entry Point | Location | Triggers | Responsibilities |
|-------------|----------|----------|------------------|
| Spring Boot Application | `be-cadelfriul/src/main/java/.../BeCadelfriulApplication.java` | `gradle bootRun` / java CLI | Initializes Spring context, JPA, Security, OpenAPI |
| Angular Browser | `bo-cadelfriul/src/main.ts` | `ng serve` | Bootstraps `App` component in browser |
| Angular SSR Server | `bo-cadelfriul/src/server.ts` | `node dist/server.mjs` | Express server rendering Angular on port 4000 |
| Next.js App Router | `fe-cadelfriul/src/app/layout.tsx` | `next dev` / `next start` | Root layout serving all pages |

## Architectural Constraints

- **Threading:** Backend uses Spring Boot's default thread-per-request model (Tomcat). Frontends are single-threaded event-loop (JS runtimes).
- **Global state:** Not detected. Angular uses signals, Next.js uses Server Components (no global state).
- **Circular imports:** Not detected — project too early-stage to exhibit this.
- **Database schema:** Auto-managed via `spring.jpa.hibernate.ddl-auto=update` — schema is derived from JPA entities at runtime. No Flyway/Liquibase migration tooling.
- **Security:** Currently disabled for development (`SecurityConfig.csrf.disable()`, `anyRequest().permitAll()`).
- **SSR:** Both frontends have SSR capability — Next.js natively, Angular via `@angular/ssr` with Express.

## Anti-Patterns

### Development-mode security configuration

**What happens:** `SecurityConfig.java` disables CSRF and permits all requests.
**Why it's wrong:** This is intended for development only but there's no profile separation. The same config would be used in production.
**Do this instead:** Use Spring profiles — wrap permissive config in `@Profile("dev")` and create a `SecurityConfigProd.java` with proper rules.

### Empty domain directories

**What happens:** `ebike/`, `ecommerce/`, `hospitality/`, `wellness/` directories exist but contain zero files.
**Why it's wrong:** Empty packages create noise and don't convey intent.
**Do this instead:** Either remove them until needed, or add a `.gitkeep` with a README explaining the planned module scope.

## Error Handling

**Strategy:** Not yet implemented. Spring Boot default error handling is active (no custom `@ControllerAdvice` or `ErrorController` detected).

**Patterns (expected based on Spring conventions):**
- `@ControllerAdvice` for global exception handling
- Custom exception classes per domain
- `ResponseEntity` for structured error responses

## Cross-Cutting Concerns

**Logging:** Spring Boot default (Logback). Configured via `application.properties` — currently no custom logging config.

**Validation:** Not yet implemented. Expected: `@Valid` / `@Validated` on request bodies in controllers, with Jakarta Bean Validation annotations on DTOs.

**Authentication:** Spring Security configured but disabled for dev. JWT expected based on admin entity structure, but no JWT filter or token logic detected yet.

---

*Architecture analysis: 2026-07-06*
