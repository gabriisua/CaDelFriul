---
id: 260731-ex6
phase: quick-260731-ex6-i18n
plan: 1
subsystem: i18n
tags: [next-intl, i18n, nextjs16, proxy, locale-routing, trilingual]
date: 2026-07-31
description: >-
  Trilingual internationalization of the Ca' Del Friul frontend: all routes moved under an
  app/[locale] segment (en default, it, de) with next-intl v4 routing/navigation/request
  config, locale-negotiating proxy composed with auth protection, Nav dictionaries, and a
  Header LanguageSwitcher with locale-preserving nav links.

requires:
  - phase: 01-foundation
    provides: route groups (vetrina), (auth), dashboard/ with Header/Footer layouts
affects: [phase-2-auth-booking, follow-up: localize Footer/SidebarNav/dashboard pages]

tech-stack:
  added: [next-intl ^4.13.4]
  patterns:
    - "Locale-based routing: top-level [locale] dynamic segment with generateStaticParams"
    - "proxy.ts composition: next-intl createMiddleware + auth checks on locale-stripped paths"
    - "Centralized i18n config: src/i18n/{routing,navigation,request}.ts + src/messages/*.json"
    - "Static rendering via setRequestLocale + getMessages before NextIntlClientProvider"

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/navigation.ts
    - src/i18n/request.ts
    - src/messages/en.json
    - src/messages/it.json
    - src/messages/de.json
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/(vetrina)/_components/LanguageSwitcher.tsx
  modified:
    - src/proxy.ts
    - src/app/[locale]/(vetrina)/_components/Header.tsx
    - next.config.ts
    - package.json
  deleted:
    - src/app/layout.tsx
    - middleware.ts (legacy, shadowed src/proxy.ts)

key-decisions:
  - "Use router.replace(pathname, { locale }) (string href) instead of the plan's {pathname, params} object form — without a `pathnames` config next-intl v4 types only accept string | {pathname, query}; the app has no dynamic segments beyond [locale], so the documented locale-switch pattern is equivalent"
  - "Load messages in src/i18n/request.ts (per official v4 docs) so the layout's getMessages() resolves — the plan's request.ts returned only { locale } which makes getMessages() throw 'No messages found'"
  - "Wire createNextIntlPlugin() in next.config.ts — required for next-intl/config to resolve src/i18n/request.ts"
  - "Add \"test\": \"vitest run\" script — the plan's npm test verification gate had no script"
  - "git rm the legacy root middleware.ts — Next.js 16 was running the deprecated middleware file instead of src/proxy.ts, breaking locale negotiation and prefixed auth"

patterns-established:
  - "Locale switch: usePathname() (locale-stripped) + router.replace(pathname, { locale }) stays on the same page"
  - "Auth on prefixed paths: strip locale prefix via routing.locales membership test, then run protected/auth checks on canonical path"
  - "Absolute next/link hrefs in Footer/SidebarNav/dashboard keep working via proxy 307 redirect (one extra hop)"

requirements-completed: [PREMIUM-04]

duration: 32min
completed: 2026-07-31
---

# Quick Task 260731-ex6: Implement Internationalization (i18n) in the Frontend — Summary

**next-intl v4 trilingual routing: all 20 routes moved under `app/[locale]` (en/it/de) with a locale-negotiating `src/proxy.ts` composed with auth protection, Nav dictionaries, and a Header LanguageSwitcher with locale-preserving nav links**

## Performance

- **Duration:** 32 min
- **Started:** 2026-07-31T08:53:41Z
- **Completed:** 2026-07-31T11:05:00Z
- **Tasks:** 2
- **Files modified:** 56 (51 in Task 1 incl. 40 renames, 3 in Task 2, 2 config)

## Accomplishments

- All 20 existing routes now served under `/en`, `/it`, `/de` URL prefixes (60 statically rendered pages), with non-prefixed URLs 307-redirecting to the negotiated locale
- next-intl v4.13.4 wiring per official docs: `src/i18n/routing.ts`, `navigation.ts`, `request.ts`, `src/messages/{en,it,de}.json` (Nav namespace, 14 keys each), `createNextIntlPlugin` in next.config.ts
- `src/proxy.ts` composes `createMiddleware(routing)` with the existing JWT auth checks on **locale-stripped** paths — `/de/dashboard` without a cookie redirects to `/de/login?from=/de/dashboard`; auth pages with a token redirect to `/{locale}/dashboard`
- `src/app/[locale]/layout.tsx` replaces the root layout: `<html lang={locale}>`, hasLocale guard → notFound(), `setRequestLocale` before `getMessages()`, `NextIntlClientProvider`, `generateStaticParams` for all 3 locales — all 60 pages statically rendered
- LanguageSwitcher (inline EN/IT/DE buttons, active locale highlighted) integrated in the Header desktop actions row and mobile nav; Header nav/CTA labels all render from the Nav dictionary in the active language

## Task Commits

1. **Task 1: Install next-intl, restructure routes under [locale], i18n config + dictionaries, compose proxy** - `f120092` (feat)
2. **Task 2: Add LanguageSwitcher and localize the Header with next-intl navigation + translations** - `555d52e` (feat)

## Verification Results

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | PASS — zero type errors (after clearing stale `.next/types` from the pre-move build) |
| `npm run build` | PASS — 60 static pages (`/en`, `/it`, `/de` × 20 routes) + Proxy (Middleware) registered, no errors |
| `npm test` | PASS — 4/4 vitest (checkout success page suite, moved under `[locale]`) |
| Runtime (dev server, curl) | `GET /` → 307 → `/en`; `GET /rooms` → 307 → `/en/rooms`; `/en`, `/it`, `/de` → 200; `/de/dashboard` (no cookie) → 307 → `/de/login?from=%2Fde%2Fdashboard`; `/en/login` (with token) → 307 → `/en/dashboard`; `/it` HTML contains "Camere", `/de` contains "Startseite" |
| Manual browser check (plan item 5: click IT on /en/rooms → /it/rooms) | NOT run — no browser automation available; behavior is covered by the documented `router.replace(pathname, {locale})` API and server-side verification above |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] `request.ts` did not return `messages`**
- **Found during:** Task 1 ([locale]/layout.tsx creation)
- **Issue:** The plan's `getRequestConfig` returned only `{ locale }`; next-intl v4's `getMessages()` throws "No messages found. Have you configured them correctly?" when `config.messages` is undefined, and the plan's layout code calls `await getMessages()` — the build would fail at render.
- **Fix:** Added `messages: (await import(`../messages/${locale}.json`)).default` to `src/i18n/request.ts` (official v4 docs pattern; relative path because this project keeps messages at `src/messages/`).
- **Files modified:** src/i18n/request.ts
- **Verification:** Build renders all 60 pages with localized nav; tsc green.
- **Committed in:** f120092 (Task 1 commit)

**2. [Rule 3 - Blocking] next-intl plugin missing from next.config.ts**
- **Found during:** Task 1 (wiring check)
- **Issue:** The plan's `files_modified` omitted next.config.ts, but `next-intl/config` throws "Couldn't find next-intl config file" unless `createNextIntlPlugin()` wraps the config — `src/i18n/request.ts` would never be resolved.
- **Fix:** `export default withNextIntl(nextConfig)` with `createNextIntlPlugin()` (default `./src/i18n/request.ts` location).
- **Files modified:** next.config.ts
- **Verification:** tsc/build/test green; locale resolution works at runtime.
- **Committed in:** f120092 (Task 1 commit)

**3. [Rule 3 - Blocking] No `test` script in package.json**
- **Found during:** Task 1 (verification gate)
- **Issue:** `npm test` failed with "Missing script: test" — the plan's automated gate could not run.
- **Fix:** Added `"test": "vitest run"` to package.json scripts.
- **Files modified:** package.json
- **Verification:** `npm test` runs the success-page suite (4/4 pass).
- **Committed in:** f120092 (Task 1 commit)

**4. [Rule 3 - Blocking] Legacy root `middleware.ts` shadowed `src/proxy.ts`**
- **Found during:** Task 2 (runtime verification of the plan's curl checks)
- **Issue:** A leftover `middleware.ts` (from quick task 260710-a1b, before that task migrated to `src/proxy.ts`) was still on disk. Next.js 16.2.10 ran the **deprecated middleware file** instead of the plan's `src/proxy.ts`: `GET /` → 404 (no locale negotiation), `/de/dashboard` without cookie → 200 (no auth redirect) — the plan's core "truths" were failing. The constraint "do NOT create a middleware.ts" was honored; the file already existed.
- **Fix:** `git rm fe-cadelfriul/middleware.ts` (deleted tracked legacy file). After restart, `src/proxy.ts` runs: `/` → 307 `/en`, `/rooms` → 307 `/en/rooms`, `/de/dashboard` → 307 `/de/login?from=...`, `/en/login`+token → 307 `/en/dashboard`.
- **Files modified:** middleware.ts (deleted)
- **Verification:** All runtime curl checks pass; full gate (tsc/build/test) re-run green after the deletion.
- **Committed in:** 555d52e (Task 2 commit)

**5. [Rule 1 - Bug] `router.replace({ pathname, params }, { locale })` does not type-check**
- **Found during:** Task 2 (LanguageSwitcher creation)
- **Issue:** The plan specified next-intl's *pathnames-config* locale-switch pattern, but this app has no `pathnames` config — next-intl v4 types the router href as `string | { pathname, query? }` and reject the `{ pathname, params }` object (excess-property error).
- **Fix:** Used the official v4 pattern for apps without `pathnames`: `router.replace(pathname, { locale: l })`, where `pathname` comes from the localized (locale-stripped) `usePathname()`. Equivalent behavior — this app has no dynamic segments beyond `[locale]`. Dropped the now-unneeded `useParams` import.
- **Files modified:** src/app/[locale]/(vetrina)/_components/LanguageSwitcher.tsx
- **Verification:** tsc green; switcher rendered on all public pages (EN/IT/DE buttons verified in HTML); locale switch follows the documented API.
- **Committed in:** 555d52e (Task 2 commit)

---

**Total deviations:** 5 auto-fixed (1 bug, 1 missing critical, 3 blocking)
**Impact on plan:** All auto-fixes were correctness/blocking requirements — without them the build failed or the core locale/auth behavior did not work. No scope creep.

## Known Stubs

None — the Nav dictionaries, LanguageSwitcher, and Header are fully wired. (Footer, SidebarNav, dashboard/auth/cart/checkout pages intentionally keep absolute `next/link` hrefs per the plan's scope note — they function via the proxy's 307 redirect with one extra hop; full localization is a documented follow-up.)

## Risks

- **Stale dev server on port 3000** (pre-existing process 6697) still runs the pre-i18n code — should be restarted by the user before manual browser testing.
- **Manual browser check** (plan verification item 5: click-based locale switching on /en/rooms → /it/rooms) was not executable in this environment; the underlying API is the documented next-intl v4 locale-switch pattern and server-side rendering of all three locales is verified.
- **Legacy `middleware.ts` deletion** removes the old unprefixed auth redirects (`/dashboard` → `/login`); the new proxy handles both prefixed and unprefixed paths, so behavior is preserved.

## Follow-ups

- Localize Footer, SidebarNav, dashboard/error/not-found pages, cart/checkout/login links to `@/i18n/navigation` (plan-scoped follow-up; requirement #4 limited the Link refactor to the Header main nav)
- Consider `localeDetection` / cookie behavior tuning for returning visitors
- Consider localized `metadata` per locale (`getTranslations({locale, namespace: 'Metadata'})`)

---

*Phase: quick-260731-ex6-i18n*
*Completed: 2026-07-31*

## Self-Check: PASSED

- SUMMARY.md exists at the expected path
- Commit `f120092` (Task 1) present in git history
- Commit `555d52e` (Task 2) present in git history
- All 10 key files from the plan's `files_modified` verified on disk (i18n config ×3, messages ×3, proxy.ts, [locale]/layout.tsx, LanguageSwitcher.tsx, Header.tsx)
- Final gate re-run after the `middleware.ts` deletion: `npx tsc --noEmit` clean, `npm run build` 60 static pages + proxy registered, `npm test` 4/4 pass
