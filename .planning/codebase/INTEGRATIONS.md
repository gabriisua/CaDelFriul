# External Integrations

**Analysis Date:** 2026-07-06

## APIs & External Services

**Backend REST API (self-hosted):**
- The backend (`be-cadelfriul/`) exposes REST endpoints consumed by both frontend projects
- API documentation auto-generated via SpringDoc OpenAPI 2.6.0 (`be-cadelfriul/src/main/java/com/cadelfriul/backend/core/config/OpenApiConfig.java`)
  - Title: "API CaDelFriul - Eco-Resort & Wellness"
  - Version: "1.0"
  - Modules declared: Hospitality, Wellness, E-Commerce, E-Bike

**Backoffice Express Server:**
- `bo-cadelfriul/src/server.ts` runs an Express 5.1 server for Angular SSR
- Serves static files from `dist/browser` with `maxAge: '1y'`
- Listen port: `process.env['PORT']` (default 4000)
- Comment hints at Firebase Cloud Functions deployment support

**No detected third-party API integrations:**
- No Stripe, PayPal, or payment gateway SDK dependencies
- No Google Maps, SendGrid, or email service dependencies
- No cloud vendor SDKs (AWS, GCP, Azure)

## Data Storage

**Databases:**
- **PostgreSQL** (primary database)
  - Connection: `jdbc:postgresql://localhost:5432/cadelfriul_db` (`be-cadelfriul/src/main/resources/application.properties`)
  - Credentials: username `postgres`, password `postgres` (dev defaults)
  - ORM/Client: Spring Data JPA with Hibernate (`spring-boot-starter-data-jpa`)
  - Schema management: Hibernate `ddl-auto=update` (auto-create/update tables)
  - SQL logging: enabled (`spring.jpa.show-sql=true`, `hibernate.format_sql=true`)
  - **Tables defined (entities):**
    - `admins` — Admin users (`be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/Admin.java`)
    - `admin_logs` — Admin audit log (`be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/AdminLog.java`)
    - `AdminRole` — Enum with `SUPER_ADMIN`, `RECEPTIONIST` (`be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/AdminRole.java`)

**File Storage:**
- Not detected — no file storage service integration, no `MultipartFile` usage detected

**Caching:**
- Not detected — no Redis, Memcached, or Spring Cache abstraction configured

## Authentication & Identity

**Auth Provider:**
- **Custom Spring Security** (in development / placeholder state)
  - Implementation: `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java`
  - CSRF: disabled
  - All requests: `permitAll()` (development-only)
  - Security test dependency: `spring-boot-starter-security-test`
  - Auth entities created but services/controllers/dto/repositories are empty stubs:
    - `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/entity/` — entities exist
    - `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/controller/` — empty
    - `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/service/` — empty
    - `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/repository/` — empty
    - `be-cadelfriul/src/main/java/com/cadelfriul/backend/core/auth/dto/` — empty

**No external auth providers detected:**
- No OAuth2/OIDC dependencies
- No Auth0, Clerk, Firebase Auth, or Supabase Auth SDKs
- No JWT library dependencies (e.g., `jjwt`, `nimbus-jose-jwt`)
- No social login integration

## Monitoring & Observability

**Error Tracking:**
- None detected — no Sentry, DataDog, or similar dependencies

**Logging:**
- Spring Boot default (SLF4J/Logback) — backend logging
- `console.log` — Angular/Next.js client-side logging
- No structured logging framework detected

**Metrics:**
- None detected — no Micrometer, Prometheus, or Grafana dependencies

## CI/CD & Deployment

**Hosting:**
- Not yet configured — no Docker, Docker Compose, or container configuration files detected
- No platform-specific configuration (Vercel, Netlify, Railway, etc.)

**CI Pipeline:**
- None detected — no `.github/`, `.gitlab-ci.yml`, or other CI config files

**Deployment Config:**
- `bo-cadelfriul/src/server.ts` contains a Firebase Cloud Functions import comment

## Environment Configuration

**Required env vars:**
| Variable | Used In | Purpose |
|----------|---------|---------|
| `PORT` | `bo-cadelfriul/src/server.ts` | Express server port (default 4000) |
| `spring.datasource.url` | `application.properties` | PostgreSQL JDBC URL |
| `spring.datasource.username` | `application.properties` | Database user |
| `spring.datasource.password` | `application.properties` | Database password |

**Secrets location:**
- Database credentials are hardcoded in `be-cadelfriul/src/main/resources/application.properties` (development only)
- `.gitignore` excludes `.env` and `.env*.local` — no committed `.env` files exist

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Payment Processing

**Not integrated:**
- No payment gateway dependencies
- No webhook endpoints for payment callbacks
- No Stripe, PayPal, or similar SDKs

## External Domains Referenced

| Domain | Context | File |
|--------|---------|------|
| `vercel.com` | Next.js template/link in starter page | `fe-cadelfriul/src/app/page.tsx` |
| `nextjs.org` | Documentation link in starter page | `fe-cadelfriul/src/app/page.tsx` |

(These are default Next.js starter links, not production integrations.)

---

*Integration audit: 2026-07-06*
