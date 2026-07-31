# Project Research Summary

**Project:** Ca' Del Friul — Hybrid Resort Booking & E-commerce Frontend
**Domain:** Premium Italian resort direct-booking platform with e-commerce (experiences, products)
**Researched:** 2026-07-08
**Confidence:** HIGH

## Executive Summary

**This is a resort direct-booking platform with an e-commerce dimension** — rooms, experiences (spa, wine tasting, cooking classes), and physical products (local wine, gift baskets) all sold through a single customer-facing website. The 2026 industry standard for this domain is a **headless/composable architecture**: Next.js 16 (App Router) as the presentation/BFF layer, Spring Boot REST API as the transactional backend, communicating exclusively via typed API contracts. The browser never talks to Spring Boot directly — Next.js handles rendering, auth session management, and API orchestration, eliminating CORS in production and keeping JWT tokens in HttpOnly cookies.

**The recommended approach is a phased build starting with the public showcase and auth, then the booking engine, then the hybrid e-commerce cart.** Research consistently shows that attempting unified cart (rooms + products) before the core booking engine is stable leads to tangled checkout logic, price staleness bugs, and double-booking race conditions. The MVP should be a fully functional resort website with room/experience/product browsing, auth, and a basic room-booking flow. The "hybrid" e-commerce dimension (unified cart, product checkout, gift vouchers) is deferred to Phase 3+ once booking inventory locking, pricing validation, and the guest→user cart merge pattern are proven.

**The five critical risks are:** (1) modeling booking and commerce items in a single cart data structure — they need separate models from day one; (2) no race-condition protection for bookable inventory — requires optimistic locking + short-lived holds + SERIALIZABLE transaction isolation on the Spring Boot side; (3) storing JWT in localStorage instead of HttpOnly cookies — XSS vulnerability with zero excuses; (4) caching prices in the cart instead of re-fetching at checkout — causes revenue leakage or abandoned carts; (5) a single checkout flow for both booking and commerce — the two have fundamentally different fields (guest names + date review vs. shipping address + delivery method) and must be visually separate. All five are preventable with upfront architectural decisions.

## Key Findings

### Recommended Stack

The stack is heavily constrained by project decisions (Next.js 16, React 19, Tailwind CSS v4, Spring Boot REST API with JWT) and is well-supported by official documentation.

**Core technologies:**
- **Next.js 16 (App Router)**: React metaframework with Turbopack, Server Components, Server Actions. **Notably:** Next.js 16 renamed `middleware.ts` to `proxy.ts` — the exported function is `proxy()`, not `middleware()`. The runtime defaults to Node.js (not Edge).
- **Zustand ^5 + TanStack Query ^5**: Zustand for client-side global state (cart, booking flow, UI state — 1KB, no Provider wrapper); TanStack Query for server state (API data caching, mutations, optimistic updates). This is the 2026 consensus pattern for Next.js commerce apps. Do NOT use Redux — it's overkill and clashes with App Router's server/client boundary.
- **ky ^1** (not axios): Lightweight native `fetch` wrapper (2KB) for Spring Boot API calls. Axios adds 14KB for features TanStack Query already provides.
- **React Hook Form ^7 + Zod ^3**: Performant form state management (uncontrolled inputs) with TypeScript-first validation. Validate on both client (RHF resolver) and server (Server Action). Do NOT use Formik.
- **shadcn/ui (latest, CLI)**: Copy-paste component primitives — not a dependency. Fully customizable for the "luxury rustic-chic" brand. Provides Calendar (react-day-picker), Dialog, Sheet (slide-out cart), Form, etc. Tailwind v4 compatible with `@theme` directives.
- **jose ^5**: JWT verification and encryption on the server. Next.js docs explicitly recommend jose for Edge/Node.js runtime. **Do NOT use `jsonwebtoken`** — it depends on Node.js crypto APIs not available at the edge.
- **date-fns ^4**: Tree-shakeable date manipulation. Use with react-day-picker ^9 for the booking calendar. Do NOT use Moment.js (deprecated, mutable, 230KB).
- **Vitest ^3 + Playwright ^1**: Unit testing and E2E testing respectively. Both have official Next.js 16 setup guides.

**Critical constraint:** "JWT Bearer tokens — no NextAuth or similar" (per PROJECT.md). Custom auth via `jose` + Server Actions + DAL (Data Access Layer) is straightforward since Spring Boot handles token issuance and validation.

See [STACK.md](./STACK.md) for full details, installation commands, and alternatives considered.

### Expected Features

**Three audience contexts, each with its own route group:** `(vetrina)` = public showcase (no auth), `(auth)` = login/register flow (minimal layout), `(dashboard)` = customer area (sidebar + user context, auth required).

**Must have (table stakes) — Phase 1-2:**
- Mobile-first responsive design (Tailwind v4 enforces this)
- Hero section with immersive visuals (cinematic hero, "luxury rustic-chic")
- Rooms & suites showcase with gallery, amenities, pricing cues
- Experiences & activities catalog
- Product/merchandise catalog (browsing only, no checkout yet)
- Online booking engine (multi-step: date picker → room selection → guest info → payment → confirmation)
- Secure payment gateway (Stripe via Spring Boot)
- Photo gallery, contact/location, about/heritage storytelling
- SEO fundamentals (Next.js Metadata API, Hotel/Product schema)
- WCAG 2.1 AA accessibility, GDPR cookie consent
- Login/registration (JWT-based), profile management, My Reservations list, My Orders list
- `loading.tsx`, `error.tsx`, `not-found.tsx` per route group

**Should have (differentiators) — Phase 2+ with priority ordering:**
1. **Phase 1 candidates** (high impact, low complexity): Local area guide (static content), social proof/testimonials section, FAQ page
2. **Phase 2 candidates** (high impact, medium complexity): Wishlist/saved items, multi-language support (Italian + English + German), virtual tour (if 360° assets exist)
3. **Phase 3+ candidates** (high impact, high complexity): **Unified shopping cart** (rooms + experiences + products — the core hybrid differentiator), dynamic packaging/bundles ("Romantic Getaway"), guest self-service portal, pre-arrival communication hub, booking timeline/itinerary view, AI-powered recommendations/upsells
4. **Phase 4+:** Group booking inquiry flow, live chat/chatbot

**Defer (v2+/never):**
- Full PMS, OTA channel management, social login, guest reviews platform, full CRM, analytics dashboard, staff task management, dynamic pricing UI, offline PWA mode, user-to-user interactions — these belong in the backend, admin system, or are irrelevant to the guest-facing frontend.

See [FEATURES.md](./FEATURES.md) for full feature breakdown, complexity ratings, and dependency graph.

### Architecture Approach

**Headless/composable architecture with Next.js as BFF (Backend for Frontend).** The browser communicates exclusively with Next.js; Next.js communicates with Spring Boot. This eliminates CORS in production and keeps JWT tokens in HttpOnly cookies inaccessible to JavaScript.

**The critical architectural insight from every production reference: separate the read path from the write path.** The read path (search, browsing, showcase) can be cached, eventually consistent, and fast. The write path (bookings, payments, orders) must be strongly consistent and transaction-safe. These two paths share only the Spring Boot API as the source of truth.

**Major components:**
1. **Middleware (proxy.ts)**: Optimistic route protection (gate on session cookie). Checks cookies only — no DB call. **Not a security boundary** — DAL handles real authorization. Next.js 16: this file is `proxy.ts`, not `middleware.ts`.
2. **Server Components (default)**: Fetch initial data from Spring Boot via the API Service Layer. Render HTML + RSC payload. Use ISR for content pages (rooms, experiences), SSR for booking/dashboard pages.
3. **Client Components (explicit `"use client"`)**: Leaves in the component tree — they receive data as props and add interactivity (calendar, cart, forms). They call Server Actions for mutations, never the API directly.
4. **Server Actions**: Form handlers for all mutations (login, add to cart, book, update profile). Validate with Zod, check authorization via DAL, POST/PUT/DELETE to Spring Boot.
5. **API Service Layer (`@/lib/services/`)**: Typed HTTP client wrappers for each Spring Boot domain (auth, booking, product, CMS). Shared between Server Components and Server Actions.
6. **Zustand stores**: Cart state (persisted to localStorage), booking flow state (date range, guests, add-ons), UI state (mobile menu, modals).
7. **Booking Flow (state machine)**: IDLE → HOLD (15-min TTL) → PAYMENT PROCESSING → CONFIRMED (or CANCELLED). Two-phase inventory locking: hold at checkout start, confirm on payment. Spring Boot handles all transactional logic with `SERIALIZABLE` isolation.
8. **Cart Architecture**: Anonymous users → encrypted HttpOnly cookie. Authenticated users → Spring Boot DB. Merge on login via `POST /api/cart/merge`. **Never store prices in the cart** — only product IDs and quantities; re-fetch all pricing at checkout.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full component map, data flow diagrams, route structure, auth flow, and scalability considerations.

### Critical Pitfalls

The top 5 pitfalls that could cause rewrites, revenue loss, or security incidents:

1. **Treating a Booking Like a Cart Item** — Rooms have date ranges, cancellation policies, and guest-count limits that have no parallel in physical products. A single `CartItem` interface with optional `checkIn`/`sku` fields leads to tangled checkout logic. **Prevention:** Design two distinct cart data structures from day one: `BookingCart` and `CommerceCart`. They share a parent container but never share item models. The checkout page must have two parallel flows.

2. **No Race Condition Protection for Bookable Inventory** — Two guests both see "1 room available," both click "Book Now" within milliseconds, both get confirmed. **Prevention:** Optimistic locking with version column on inventory. Short-lived holds (10-15 min TTL) when user enters the booking flow. Spring Boot must use `SERIALIZABLE` isolation for booking confirmation. Show countdown timer on frontend reflecting hold window.

3. **JWT Stored in localStorage / No Refresh Token Rotation** — XSS vulnerability leaks the token, and the attacker gains persistent access to the victim's account. **Prevention:** HttpOnly, Secure, SameSite=Strict cookies only. Access token TTL: 15 minutes. Refresh token rotation (each refresh invalidates the previous token). Use `jose` for middleware token verification (edge-compatible).

4. **Cart Price Staleness During Checkout** — User adds item to cart, price cached client-side, 10 minutes later price changes, user checks out at old price. **Prevention:** Never store prices in the cart. Only store product/room IDs, quantities, dates. Re-fetch all pricing from Spring Boot via a Server Action at checkout time. Display "Prices updated" shimmer during recalculation.

5. **Single Checkout Flow for Both Product Types** — Room booking needs guest names, date review, cancellation policy. Wine purchase needs shipping address, delivery method, age verification. Forcing both through one form creates UX friction and data-model mismatches. **Prevention:** Two visually separate checkout flows sharing only the shell (logo, progress indicator, security badges). If mixed cart is allowed, split checkout into tabs/stages.

See [PITFALLS.md](./PITFALLS.md) for the full list (14 pitfalls), including moderate pitfalls (Route Handler misuse, stale Route Handler cache, no guest→user cart merge, timezone mismanagement, marketing/app mixing) and minor pitfalls (no loading/error boundaries, cart/booking abandonment, promotion stacking, capacity-based vs date-based inventory confusion).

## Implications for Roadmap

Based on combined research across all four domains, the build order is determined by three constraint chains:
- **Data dependency:** Auth → API Service Layer → Booking Engine + E-commerce → Unified Cart
- **Architecture dependency:** Route Groups must exist before any page is built. API Service Layer must exist before any feature calls Spring Boot. Auth must work before any protected route is meaningful.
- **Risk dependency:** Race condition protection and cart data modeling must be designed before the booking engine and unified cart are built — retrofitting is extremely painful.

### Phase 1: Foundation — Scaffold & Public Showcase
**Rationale:** Route groups define the entire architecture. Static showcase pages have zero API dependencies and can be built immediately. Establishing import boundaries, error boundaries, and date-handling patterns now prevents architectural debt that would be expensive to fix later.
**Delivers:** Route group structure `(vetrina)`, `(auth)`, `(dashboard)` with layouts. Homepage, rooms showcase (static), experiences catalog (static), products catalog (static), about/contact/local-area pages, testimonials/social proof section, photo gallery, SEO metadata, `loading.tsx`/`error.tsx`/`not-found.tsx` per group.
**Addresses FEATURES.md:** All table-stakes showcase features; local area guide and testimonials (low-complexity differentiators).
**Avoids PITFALLS.md #10** (marketing/app mixing) by enforcing Route Group boundaries with ESLint `import/no-restricted-paths` from day one. **Avoids #11** (missing loading/error boundaries) by creating structural files upfront. **Addresses #9** (timezone mismanagement) by establishing `date-fns` patterns for date handling.
**Research flag:** Low — standard Next.js patterns, well-documented. Skip `/gsd-research-phase`.

### Phase 2: Auth & API Integration
**Rationale:** Auth is prerequisite for all dashboard and booking features. The API Service Layer must exist before any feature calls Spring Boot. Doing auth with the correct security patterns is the most security-critical phase.
**Delivers:** Login/register/password-reset pages (`(auth)` route group), JWT auth with HttpOnly cookies, proxy.ts route protection (optimistic), refresh token rotation, `session.ts` (jose encryption/decryption), `dal.ts` (Data Access Layer). API Service Layer with typed clients for each Spring Boot domain (auth, products, experiences, bookings, CMS). Server Action pattern established.
**Addresses FEATURES.md:** All auth features, API integration infrastructure.
**Avoids PITFALLS.md #3** (JWT in localStorage — use HttpOnly cookies with jose), **#6** (Route Handlers when Server Components would work — establish direct API service calls from Server Components), **#7** (stale Route Handler cache — use `export const dynamic = 'force-dynamic'` on time-sensitive routes).
**Research flag:** Low — JWT auth without NextAuth is well-documented in Next.js 16 official auth guide. Skip `/gsd-research-phase`.

### Phase 3: Booking Engine & Dashboard
**Rationale:** The booking engine is the core conversion feature. It should stabilize before the unified cart complicates checkout. Dashboard surfaces booking/order data that the engine produces. **This phase must implement the two-phase inventory locking pattern before going live.**
**Delivers:** Room availability calendar (react-day-picker + date-fns), multi-step booking flow (date → room → guest info → payment → confirmation), booking confirmation page, Stripe Payment Element integration (via Spring Boot), Dashboard shell (sidebar layout), My Reservations list, My Orders list, Profile management, Wishlist.
**Addresses FEATURES.md:** Core booking engine (table stakes), basic dashboard, wishlist (medium-impact differentiator).
**Avoids PITFALLS.md #2** (race condition — implement optimistic locking + holds + SERIALIZABLE isolation), **#5** (single checkout flow — booking checkout is separate from commerce checkout by design), **#14** (capacity-based vs date-based inventory — model with discriminator upfront).
**Critical:** The Spring Boot API must implement the booking state machine (IDLE → HOLD → PAYMENT → CONFIRMED/CANCELLED) and the hold TTL before frontend connects.
**Research flag:** Medium — booking engine patterns are well-documented, but the precise Spring Boot API contract needs negotiation. Consider `/gsd-research-phase` if the API contract is undefined.

### Phase 4: Hybrid E-commerce (Unified Cart)
**Rationale:** Product checkout builds on the booking engine's payment infrastructure. The unified cart (rooms + experiences + products) is the core differentiator but adds significant complexity. Building it after the booking engine is stable prevents the "treating booking like cart item" pitfall.
**Delivers:** `CommerceCart` data structure (separate from `BookingCart`), product checkout flow (shipping address, delivery method, quantity confirmation), `BookingCart` + `CommerceCart` merge into a unified cart view, guest→user cart merge on login, gift vouchers (purchasable e-commerce item), dynamic packaging / bundled offers ("Romantic Getaway" = Room + Dinner + Spa).
**Addresses FEATURES.md:** Unified shopping cart, product checkout, gift vouchers, dynamic packaging.
**Avoids PITFALLS.md #1** (separate BookingCart/CommerceCart data structures from day one), **#4** (price staleness — never store prices, re-fetch at checkout), **#8** (guest→user cart merge — implement `POST /api/cart/merge` on Spring Boot side), **#13** (promotion stacking — item-level eligibility rules with per-item pricing breakdown).
**Research flag:** Medium-high — hybrid commerce cart patterns are less documented than pure e-commerce. The unified cart UX (tabs/stages for booking vs. commerce details) needs design validation. Recommend `/gsd-research-phase` for the cart merge and checkout flow architecture.

### Phase 5: Advanced — CMS Integration & Multi-Language
**Rationale:** CMS integration is additive and non-blocking — content can initially live in Spring Boot. Multi-language is Phase 2+ per FEATURES.md but practically needs content structure before translation.
**Delivers:** Headless CMS integration (Strapi or Sanity), webhook-based ISR revalidation for content changes, content components for rich text/block content, Italian + English + German language support (i18n library), virtual tour (if assets exist), guest self-service portal (modify/cancel, messaging).
**Addresses FEATURES.md:** CMS integration, multi-language support, advanced dashboard features, virtual tour.
**Research flag:** High — CMS choice (Strapi vs Sanity) and i18n strategy (next-intl vs route-based i18n) need dedicated research. Recommend `/gsd-research-phase` before this phase begins.

### Phase 6: Retention & Growth
**Rationale:** Requires booking data (for AI recommendations), real-time infrastructure (for chat), and proven booking volume (for group booking flow).
**Delivers:** AI-powered recommendations/upsells (based on historic booking data), group booking inquiry flow (weddings, corporate retreats), pre-arrival communication hub (timeline, check-in instructions, in-stay concierge), cart/booking abandonment recovery emails, live chat/chatbot.
**Addresses FEATURES.md:** All remaining differentiators and deferred features.
**Avoids PITFALLS.md #12** (no cart/booking abandonment recovery — implement booking-specific recovery within 24 hours).
**Research flag:** High — AI recommendations need data that doesn't exist yet. Chatbot/real-time infrastructure is a new domain. Recommend `/gsd-research-phase` for the chat solution.

### Phase Ordering Rationale

- **Route Groups before features** — They define component boundaries, import restrictions, and layouts. Building them first prevents the "marketing and app logic mixed" pitfall.
- **Auth before API calls** — You cannot securely call Spring Boot without JWT. Auth is also prerequisite for dashboard and booking.
- **Booking engine before unified cart** — The booking engine has race condition, inventory locking, and timezone requirements that don't exist for product checkout. Attempting unified cart before booking is stable guarantees Pitfall #1 (single cart model) and Pitfall #5 (single checkout flow).
- **Dashboard after booking + e-commerce** — Dashboard surfaces data from booking and order APIs. It's the consumer, not the producer.
- **CMS last** — Content can live in Spring Boot for MVP. CMS integration is additive and non-blocking.
- **Multi-language after content structure** — i18n requires content to exist before translation strings can be authored.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Hybrid E-commerce):** Unified cart UX patterns for mixed booking+commerce checkouts are not well-documented. Need design validation.
- **Phase 5 (CMS & i18n):** CMS platform choice (Strapi vs Sanity vs Contentful) has architectural implications. i18n strategy (next-intl vs custom route-based) needs evaluation.
- **Phase 6 (Retention):** AI recommendations require data strategy. Chat infrastructure (WebSocket vs polling vs third-party) needs dedicated research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Route groups, static pages, Tailwind theme — standard Next.js patterns.
- **Phase 2 (Auth & API):** JWT without NextAuth is documented in Next.js 16 official auth guide. API service layer pattern is standard.
- **Phase 3 (Booking Engine):** Booking engine patterns are well-documented in the ARCHITECTURE research. The main risk is the Spring Boot API contract, not the frontend implementation.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16, React 19, Tailwind v4, shadcn/ui — all verified against official docs. Zustand + TanStack Query is consensus 2026 pattern across 6+ sources. |
| Features | HIGH | Sourced from industry research (Cloudbeds, SaleCycle, Oysterlink, Inntopia, Hospitality Net). Feature priorities align with direct-booking best practices. |
| Architecture | HIGH | Verified against 16 production-grade references (AWS Hospitality Architecture, Airbnb double-booking prevention, multiple Spring Boot + Next.js production repos, Next.js official docs). |
| Pitfalls | HIGH | Top 5 critical pitfalls verified across multiple sources (Netgroup, Authgear, Adamo Software, Vercel/Lee Robinson, OWASP patterns). Moderate pitfalls well-referenced. Minor pitfalls are logical extensions of the critical ones. |

**Overall confidence:** HIGH — this is a well-understood domain with mature patterns. The research is consistent across official documentation, production code references, and industry analyses. No findings are based on single sources.

### Gaps to Address

- **Spring Boot API contract undefined:** The architecture assumes specific API endpoints (e.g., `POST /api/bookings/hold`, `POST /api/cart/merge`, `POST /api/auth/login` returning specific shapes). The exact API contract needs negotiation with the backend team before Phase 2. The frontend can proceed with typed service stubs, but integration timing depends on API readiness.
- **Stripe payment flow:** The frontend needs to know which Stripe integration mode Spring Boot uses (Payment Element vs Checkout Session redirect vs custom). Payment Element embedded in the checkout page is assumed but not confirmed. This affects checkout page architecture in Phase 3.
- **CMS platform decision:** Not required for MVP (Phase 1-3), but the decision between Strapi, Sanity, or keeping content in Spring Boot affects Phase 5 architecture. No research was done on CMS-specific integration patterns.
- **i18n library choice:** `next-intl` vs `react-intl` vs custom route-based i18n. All are viable; needs evaluation before Phase 5. Not blocking for MVP.
- **Cart merge endpoint availability:** The guest→user cart merge (Pitfall #8 prevention) requires `POST /api/cart/merge` on the Spring Boot side. Confirm existence before Phase 4.

## Sources

### Primary (HIGH confidence)
- **Next.js 16 Official Docs** — Authentication guide, Forms guide, proxy.ts convention, Vitest setup (`node_modules/next/dist/docs/`) — confirms JWT auth without NextAuth, Server Action patterns, Route Groups
- **shadcn/ui Documentation** — `ui.shadcn.com/docs/installation/next`, `ui.shadcn.com/docs/tailwind-v4` — confirms Tailwind v4 setup and component usage
- **AWS Sample Hospitality Architecture** — `github.com/aws-samples/sample-hospitality-systems` — confirms component boundaries, booking engine vs PMS distinction
- **Hotel Reservation System Design (HLD Handbook)** — `hld.handbook.academy` — confirms read/write path separation, exclusion constraints, Saga pattern
- **Airbnb Architecture: Double-Booking Prevention** — `mdsanwarhossain.me` — confirms inventory service, optimistic locking, payment escrow
- **SmartServe AI Booking Platform (GitHub)** — `github.com/iprasuk/smartserve-ai-booking-platform` — confirms Spring Boot + Next.js JWT architecture
- **Next.js 16 + Clerk Booking Starter** — `codexmachina.dev` — confirms booking schema, Edge proxy pattern
- **Spring Boot + Next.js JWT Auth (Boilerships)** — `boilerships.com` — confirms BFF proxy pattern, HttpOnly cookies, CORS elimination
- **Netgroup (2026)** — "8 Hybrid Commerce Mistakes" — confirms Pitfalls #1, #5, #8, #13
- **Authgear (2026)** — "JWT Authentication to Next.js App Router" — confirms Pitfall #3 prevention
- **Adamo Software (2026)** — "Solving the Inventory Nightmare" — confirms Pitfall #2 prevention
- **Vercel/Lee Robinson (2024)** — "Common mistakes with the Next.js App Router" — confirms Pitfalls #6, #7

### Secondary (MEDIUM confidence)
- **Oysterlink Travel Booking Statistics (2026)** — ~60% mobile traffic — used for feature prioritization
- **SaleCycle Travel Cart Abandonment Research (2026)** — 80%+ abandonment on clunky flows — used for booking flow UX prioritization
- **Cloudbeds Booking Engine documentation** — Feature reference for booking engine capabilities
- **Inntopia Commerce** — Resort-specific hybrid booking patterns
- **Zustand + Next.js App Router tutorials** — Multiple WebSearch sources confirming state management pattern
- **Medium/Ann R. (2026)** — Booking system availability and overbooking rules
- **DEV/Kharonte (2026)** — Spring Boot JWT setup for Next.js
- **ZeroUtil (2026)** — JWT security mistakes
- **Stack Overflow** — Race condition prevention discussion

### Tertiary (LOW confidence)
- **Reddit r/nextjs** — E-commerce cart discussion (single thread, but pattern confirmed by other sources)
- **Mozello Blog (2026)** — CRM and abandoned cart features (vendor blog, but standard patterns)
- **BuildBaseKit (2026)** — JWT mistakes in Spring Boot (practitioner blog, verified against Spring Security docs)

---

*Research completed: 2026-07-08*
*Ready for roadmap: yes*
