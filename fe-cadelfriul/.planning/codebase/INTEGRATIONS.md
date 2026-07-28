# External Integrations

**Analysis Date:** 2026-07-08

## APIs & External Services

**None detected.**
- The project is a fresh Next.js scaffold (`create-next-app`).
- No SDK imports, API client libraries, or external service dependencies are present in `package.json`.
- No custom API route handlers exist under `src/app/api/`.
- No service-layer abstractions detected.

## Data Storage

**Databases:**
- None — no database client dependencies installed (no Prisma, Drizzle, pg, MongoDB, etc.)

**File Storage:**
- None — no file storage SDKs (no S3, Cloudinary, Vercel Blob, etc.)

**Caching:**
- None — no caching service SDKs (no Redis, Vercel KV, etc.)

## Authentication & Identity

**Auth Provider:**
- None — no auth library installed (no NextAuth.js, Clerk, Auth0, Lucia, etc.)

## Monitoring & Observability

**Error Tracking:**
- None — no error monitoring SDK (no Sentry, Datadog, etc.)

**Logs:**
- None — relies on default Next.js / `console` (no logging framework)

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured. Project is deployable to Vercel (standard Next.js target) or any Node.js hosting platform.
- No Dockerfile or deployment manifests present.
- No Vercel CLI or platform-specific config.

**CI Pipeline:**
- None detected — no CI configuration files (no GitHub Actions, CircleCI, etc.)

## Environment Configuration

**Required env vars:**
- None currently defined (no `.env.example` or `.env` files)

**Secrets location:**
- Not applicable — no secrets management configured

## Webhooks & Callbacks

**Incoming:**
- None — no webhook route handlers

**Outgoing:**
- None — no outgoing webhook infrastructure

## Fonts Integration

**Google Fonts (via Next.js):**
- `next/font/google` — `Geist` and `Geist_Mono` loaded in `src/app/layout.tsx`
- Subset: `latin`
- Variable CSS custom properties: `--font-geist-sans`, `--font-geist-mono`

---

*Integration audit: 2026-07-08*
