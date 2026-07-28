# Ca' Del Friul — Frontend

## What This Is

A hybrid Resort Booking & E-commerce frontend for the "Ca' Del Friul" premium Italian resort. Serves as both a public showcase website (marketing pages, experiences, products) and a private customer dashboard (profile management, orders, reservations). Built with Next.js App Router, TypeScript, and Tailwind CSS.

## Core Value

Guests can explore the resort, discover experiences and products, and manage their bookings and orders from a single, beautiful web application.

## Requirements

### Validated

- ✓ Next.js 16 App Router configured with TypeScript — existing
- ✓ Tailwind CSS 4 styling pipeline with PostCSS — existing
- ✓ Root layout with Geist fonts and responsive HTML shell — existing
- ✓ Home page route at `/` — existing
- ✓ React Compiler enabled in `next.config.ts` — existing
- ✓ ESLint flat config with core-web-vitals + TypeScript rulesets — existing

### Active

- [ ] Route group `(vetrina)` — public marketing site with Header and Footer layout
- [ ] Route group `(auth)` — clean, distraction-free login/registration layout
- [ ] Route group `(dashboard)` — private app with Sidebar navigation layout
- [ ] Placeholder pages for each route group
- [ ] Luxury rustic-chic Tailwind CSS theme (olive greens, stone grays, muted golds)
- [ ] Update root layout metadata from "Create Next App" boilerplate

### Out of Scope

- Spring Boot API integration — deferred to Phase 2+
- JWT authentication logic — deferred to Phase 2+
- Real booking/cart/checkout flows — deferred to Phase 3+
- Complex client state management — deferred
- Backend API routes (`src/app/api/`) — deferred

## Context

The codebase is a fresh Next.js 16 scaffold with no custom code. The backend is a separate Spring Boot REST API using JWT bearer tokens for auth. Design direction is "luxury rustic-chic" — earthy, warm, minimal, and inviting.

The project will eventually serve two distinct audiences:
1. **Public visitors** browsing the resort showcase
2. **Registered customers** managing their account via a dashboard

## Constraints

- **Architecture**: Next.js Route Groups (`(vetrina)`, `(auth)`, `(dashboard)`) for clear route segregation
- **Styling**: Tailwind CSS only — no CSS-in-JS or CSS Modules
- **Backend**: Consumes Spring Boot REST API (separate repo) — frontend is API consumer only
- **Auth**: JWT Bearer tokens — no NextAuth or similar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Route Groups for layout segregation | Clean separation of concerns for 3 distinct UX contexts (public/auth/dashboard) | — Pending |
| Luxury rustic-chic Tailwind theme | Premium Italian resort brand identity; earth tones | — Pending |
| No state management library yet | Scaffold phase is purely structural; state decisions deferred | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-08 after initialization*
