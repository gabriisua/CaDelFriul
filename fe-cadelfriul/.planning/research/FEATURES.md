# Feature Landscape: Hybrid Resort Booking & E-commerce

**Domain:** Premium Italian resort direct-booking platform with e-commerce (experiences, products)
**Researched:** 2026-07-08
**Project phase:** Greenfield — scaffold exists (Next.js 16, Tailwind CSS 4), no route groups, no backend integration yet

## Audience Model

The platform serves two distinct audiences in different UX contexts:

1. **Public Visitors** (no auth) — `(vetrina)` route group — browsing the resort showcase
2. **Registered Customers** (JWT auth) — `(dashboard)` route group — managing bookings/orders/profile

A third `(auth)` route group handles the login/registration funnel with a minimal, focused layout.

---

## Table Stakes

Features users expect from any modern resort website. Missing these = visitors leave or distrust the brand. Complexity ratings assume a Next.js frontend consuming a Spring Boot API.

| Feature | Why Expected | Complexity | Notes |
|---------|-------------|------------|-------|
| **Mobile-first responsive design** | ~60% of travel traffic is mobile (Oysterlink, 2026); Google ranks on mobile UX | Low | Already enforced by Tailwind CSS 4 + responsive layout; no excuse to skip |
| **Hero section with immersive visuals** | First impression sets brand perception — video or high-res hero image is standard for premium hospitality | Low | Full-width, cinematic imagery/video; "luxury rustic-chic" aesthetic |
| **Rooms & suites showcase** | Primary reason visitors come to the site; needs gallery, amenity lists, pricing cues, size, capacity | Med | Gallery + accordion/tab amenity list + CTA to booking flow; deferred data from API |
| **Real-time availability & pricing** | Without it the booking engine is useless; users expect to see what's free and what it costs | Med | Requires backend API integration; can stub with mock data initially |
| **Experiences & activities catalog** | Resorts differentiate on offerings (wine tasting, cooking classes, spa, excursions); visitors browse these | Med | Cards + detail pages; could link to booking or inquiry flow |
| **Product / merchandise showcase** | E-commerce dimension (local products, gift shop, F&B packages); table stakes for the hybrid model | Med | Product cards, categories, pricing — standard e-commerce catalog pattern |
| **Online booking engine** | Direct bookings avoid OTA commissions (15–25%); booking abandonment >80% if flow is clunky (SaleCycle) | High | Multi-step: date picker → room selection → guest info → extras → payment → confirmation. Core complexity |
| **Secure payment gateway** | PCI DSS compliance expected; no trust = no booking | Med | Stripe or similar; handled via backend — frontend needs Payment Element integration |
| **Clear CTAs throughout** | "Book Now", "Explore Rooms", "View Experiences" — persistent, sticky on mobile | Low | Design pattern, not an API dependency |
| **Photo gallery** | Visual trust — guests won't book without seeing the property from multiple angles | Low | Lightbox/gallery component; static content initially |
| **Contact & location info** | Hours, phone, email, map embed, directions | Low | Static content |
| **About / heritage storytelling** | Luxury brands need narrative — history of the estate, the region (Friuli), the family | Low | Static content page |
| **Login / Registration** | Gateway to dashboard; JWT-based, clean auth layout | Med | `(auth)` route group; no social login (see anti-features) |
| **Profile management** | Registered users manage name, email, phone, preferences, password | Med | Dashboard feature; reads/writes to API |
| **My Reservations list** | Guests need to see upcoming and past bookings — status, dates, room, total | Med | Dashboard feature; tabular with status badges |
| **My Orders list** | E-commerce counterpart — product purchases with status (confirmed, shipped, delivered) | Med | Dashboard feature |
| **Booking confirmation & email** | Post-booking: clear confirmation page + email with details, cancellation policy, add-ons | Med | Confirmation page is frontend; email is backend-triggered |
| **SEO fundamentals** | Meta tags, structured data (Hotel schema, Product schema), sitemap, robots.txt | Low | Next.js Metadata API handles this well |
| **Accessibility (WCAG 2.1 AA)** | Legal requirement in EU; excludes no users | Med | Keyboard nav, screen reader support, contrast ratios |
| **GDPR compliance** | Cookie consent, privacy policy, data handling transparency | Low | Cookie banner + consent management; EU requirement |
| **404 / error pages** | Necessary for good UX when routes fail | Low | Custom error boundary + not-found page in Next.js |

---

## Differentiators

Features that create competitive advantage. Not strictly required, but they increase conversion, guest loyalty, and average order value. Not all need to ship in MVP — prioritize those with highest impact on conversion.

| Feature | Value Proposition | Complexity | When to Build |
|---------|------------------|------------|---------------|
| **Unified shopping cart (rooms + experiences + products)** | The core hybrid differentiator. Guest books a room, adds a cooking class, adds a bottle of wine from the shop — all in one cart, one checkout. Competitors force separate bookings | **High** | Phase 3+ (core booking engine stable first) |
| **Dynamic packaging (bundles)** | "Romantic Getaway" = Deluxe Room + Candlelit Dinner + Spa treatment. Higher AOV, easier decision for guests | High | Phase 3+ |
| **Guest self-service portal** | Modify/cancel reservations, update payment method, sign policies digitally, upload documents, message the resort 24/7 | High | Phase 3+ (after core dashboard) |
| **Wishlist / Saved items** | Guests save room types, experiences, products — return later to book/buy; builds intent over time | Med | Phase 2+ |
| **Gift vouchers / digital gift cards** | Sell "Ca' Del Friul Experience" as a gift; purchasable e-commerce item that can be redeemed against booking | Med | Phase 3+ |
| **AI-powered recommendations / upsells** | "Guests who booked this room also added..." — cross-sell experiences and products during/after booking | Med | Phase 3+ (needs booking data) |
| **Pre-arrival & in-stay communication hub** | Dashboard timeline: pre-arrival info → check-in instructions → in-stay concierge requests → checkout summary | High | Phase 3+ |
| **Immersive virtual tour / 360° rooms** | Premium positioning — lets visitors "walk through" rooms and grounds before booking | Med | Phase 2+ (if assets exist) |
| **Local area / Friuli guide** | Contextual content: local wineries, attractions, events — positions the resort as gateway to the region | Low | Phase 1 (static content) |
| **Multi-language support** | Italian + English + German (Friuli is near Austria/Slovenia) — expands addressable market | Med | Phase 2+ |
| **Booking timeline / itinerary view** | Dashboard shows full stay timeline: check-in, activities booked by day, dining reservations, checkout | Med | Phase 3+ |
| **Social proof (curated reviews, press mentions)** | "As featured in..." + carefully selected guest testimonials — builds trust without needing a full review platform | Low | Phase 1 (static/testimonial component) |
| **Real-time room availability calendar** | Visual calendar view of availability by room type — power users prefer this over date-picker alone | Med | Phase 2+ |
| **Group booking inquiry flow** | Weddings, family reunions, corporate retreats — multi-room bookings with different inquiry/approval flow | High | Phase 4+ (deferred) |

### Differentiator Priority Matrix for MVP

```
High Impact + Low Complexity = Build NOW:
  - Local area guide (static content)
  - Social proof / testimonials section
  - Gift vouchers (link to purchase flow)

High Impact + Medium Complexity = Build SOON (Phase 2):
  - Wishlist / saved items
  - Multi-language support
  - Virtual tour (if assets exist)

High Impact + High Complexity = Build LATER (Phase 3+):
  - Unified cart (rooms + experiences + products)
  - Dynamic packaging / bundles
  - Guest self-service portal
  - AI-powered upsells
```

---

## Anti-Features

Features to explicitly NOT build into the frontend. These belong either in the backend (Spring Boot), in a separate admin system, or should be deferred past the initial release.

| Anti-Feature | Why Avoid | What to Do Instead |
|-------------|-----------|-------------------|
| **Full PMS (Property Management System)** | Backend responsibility. The frontend should never manage room inventory, housekeeping, billing reconciliation | Consume PMS data via API; admin UI is a separate concern (or handled by the Spring Boot team) |
| **OTA channel management** | Syncing rates/availability to Booking.com, Expedia etc. is backend/distribution infrastructure | The backend handles channel manager integration; frontend is booking-consumer only |
| **On-page live chat / AI chatbot** | Premature for a scaffold project; adds real-time infrastructure (WebSocket) and AI training burden | Defer to Phase 4+; use simple contact form + FAQ in MVP |
| **Social media login (Google, Facebook)** | JWT auth is already the project decision; social login adds OAuth complexity for marginal gain | Standard email+password registration; revisit if data shows registration friction |
| **Guest reviews & ratings platform** | Requires moderation system, fake review prevention, content policy. Premature with zero real guests | Curated testimonials (added by resort staff) instead of open review platform |
| **Full CRM** | Guest profile enrichment, segmentation, marketing automation belongs in the backend | Frontend only shows/edit profile data the user provides |
| **Analytics dashboard (charts, occupancy rates)** | Operational analytics are for resort management, not the guest-facing site | Those are admin dashboard features, not customer-facing |
| **Staff task management** | Housekeeping requests, maintenance ticketing — internal operations, not guest-facing | Handled in backend admin system |
| **Dynamic pricing / yield management UI** | Pricing strategy is backend/middleware logic; frontend just displays rates | The frontend shows the *result* of pricing logic (API provides final price) |
| **Offline PWA mode** | Adds significant complexity (service workers, cache management) for limited benefit in a resort context | Defer permanently unless a specific need arises (poor connectivity at the resort is unlikely for website browsing) |
| **User-to-user interactions** | No social features (chat, forums, shared itineraries) — not relevant for a resort booking platform | Keep it a single-user experience |

---

## Feature Dependencies

Critical ordering constraints:

```
Phase 1 — Foundation
├── Auth system (login/register)
│   └── Required by: All dashboard features
├── Room showcase page
│   └── Required by: Booking engine (needs room data)
├── Experience catalog page
│   └── Required by: Unified cart (needs experience data)
├── Product catalog page
│   └── Required by: Unified cart, product orders
└── Static pages (about, contact, etc.)

Phase 2 — Interactivity
├── Wishlist/Saved items
│   └── Requires: Auth middleware (user context)
├── Multi-language support
│   └── Requires: i18n library integration
├── Booking engine (basic)
│   └── Requires: Room data API, payment gateway
│   └── Required by: Dashboard reservations
│   └── Required by: Unified cart
└── Basic dashboard
    ├── Profile management
    ├── My Reservations (read)
    └── My Orders (read)

Phase 3 — Hybrid Commerce
├── Unified cart
│   └── Requires: Booking engine, experience catalog, product catalog
│   └── Required by: Dynamic packaging
├── Guest self-service portal
│   └── Requires: Auth, booking engine, dashboard shell
├── Pre-arrival hub
│   └── Requires: Booking engine, dashboard
└── Gift vouchers
    └── Requires: Product catalog, payment gateway

Phase 4 — Advanced
├── Group booking flow
├── AI-powered recommendations
│   └── Requires: Historic booking/order data
└── Live chat / chatbot
    └── Requires: Real-time messaging infrastructure
```

### Dependency Graph (Simplified)

```
Auth System ─────────────────────────────────────────┐
    ├── Dashboard Shell (layout + sidebar)           │
    │   ├── Profile Management                       │
    │   ├── My Reservations ← Booking Engine ────────┤
    │   ├── My Orders ← Product Catalog ─────────────┤
    │   └── Guest Portal ← Booking Engine + Auth ────┤
    │                                                 │
Room Showcase ───┐                                   │
Experiences ──────┤── Booking Engine ──┐             │
Products ─────────┘                    ├── Unified   │
                                       │    Cart ────┤
Static Pages (About, Contact, etc.)    └─────────────┘
```

---

## MVP Recommendation (Phase 1 — What ships first)

The MVP should be a **fully functional resort showcase + auth + basic dashboard**. The "hybrid" e-commerce dimension (unified cart, product checkout) is deferred to Phase 3 because it significantly increases booking-engine complexity.

### Priority Order

1. **Room showcase** with gallery, amenities, pricing (static → API-backed) — *table stakes*
2. **Experiences catalog** — *table stakes* 
3. **Product catalog** (e-commerce browsing, no checkout yet) — *table stakes*
4. **Static pages**: About, Contact, Local Area Guide, FAQ — *table stakes + easy differentiator*
5. **Testimonials / Press section** — *easy differentiator*
6. **Auth system** (login, register, logout) — *table stakes*
7. **Dashboard shell** (sidebar nav, layout) — *table stakes*
8. **Profile management** — *table stakes*
9. **Basic booking engine** (room booking with payment) — *table stakes*
10. **My Reservations (read-only)** — *table stakes*

### Deliberately Deferred from MVP

| Feature | Reason for Deferral |
|---------|-------------------|
| Unified cart (rooms + products) | Significantly complicates checkout; room booking should stabilize first |
| Product checkout (e-commerce) | Needs cart infrastructure; start with rooms-only booking |
| Guest self-service portal | Requires robust booking modification API from backend |
| Multi-language | Adds i18n library + translation overhead; ship in Phase 2 |
| Gift vouchers | Requires product purchase flow; ship in Phase 3 |
| Wishlist | Low impact for MVP; ship in Phase 2 |
| AI recommendations | Requires data no one has yet; ship in Phase 4 |

---

## Feature Grouping by Route Group

### `(vetrina)` — Public showcase

| Feature | Type | Phase |
|---------|------|-------|
| Hero section (cinematic) | Table stakes | 1 |
| Rooms & suites grid | Table stakes | 1 |
| Room detail page | Table stakes | 1 |
| Experiences catalog | Table stakes | 1 |
| Experience detail page | Table stakes | 1 |
| Products catalog | Table stakes | 1 |
| Product detail page | Table stakes | 1 |
| Photo gallery | Table stakes | 1 |
| Local area guide | Differentiator | 1 |
| About / history | Table stakes | 1 |
| Contact page | Table stakes | 1 |
| FAQ page | Table stakes | 1 |
| Social proof / testimonials | Differentiator | 1 |
| Booking engine (embedded) | Table stakes | 2 |
| Booking confirmation page | Table stakes | 2 |
| Virtual tour (360°) | Differentiator | 2 |
| Multi-language support | Differentiator | 2 |
| Unified cart (rooms + experiences + products) | Differentiator | 3 |
| Gift vouchers | Differentiator | 3 |
| Group booking inquiry | Differentiator | 4 |

### `(auth)` — Login / Registration

| Feature | Type | Phase |
|---------|------|-------|
| Login form | Table stakes | 1 |
| Registration form | Table stakes | 1 |
| Forgot password flow | Table stakes | 1 |
| Password reset form | Table stakes | 1 |

### `(dashboard)` — Customer area

| Feature | Type | Phase |
|---------|------|-------|
| Dashboard shell (sidebar layout) | Table stakes | 1 |
| Profile (name, email, phone, password) | Table stakes | 1 |
| My Reservations (list + detail) | Table stakes | 2 |
| My Orders (list + detail) | Table stakes | 2 |
| Saved items / Wishlist | Differentiator | 2 |
| Booking modification / cancellation | Differentiator | 3 |
| Guest self-service portal | Differentiator | 3 |
| Pre-arrival hub | Differentiator | 3 |
| Booking timeline / itinerary | Differentiator | 3 |
| Loyalty points / rewards | Differentiator | 4 |

---

## Complexity Scoring Key

- **Low** — UI component with static/stubbed data; no API dependency or trivial fetch
- **Med** — Requires API integration, form state management, auth context; 2–5 days dev time
- **High** — Multi-step flow, payment integration, complex state (cart), multiple API endpoints; 1–3 weeks dev time

---

## Feature Evolution Notes

The line between "differentiator" and "table stakes" will shift over time:

- **Booking engine** was a differentiator in 2018; it's table stakes in 2026
- **Mobile-first** was a differentiator in 2017; it's table stakes now
- **Unified cart** for resorts is a differentiator today; will be table stakes for any resort website by 2028
- **AI recommendations** are emerging differentiators now; will become expected within 2–3 years

The roadmap should explicitly re-evaluate this categorization at each milestone.

---

## Sources

- SaleCycle Travel Cart Abandonment Research (2026) — 80%+ abandonment on clunky booking flows
- Oysterlink Travel Booking Statistics (2026) — ~60% of travel traffic from mobile
- Cloudbeds Booking Engine documentation — feature reference for booking engine capabilities
- Inntopia Commerce — resort-specific hybrid booking (rooms + activities + products in one cart)
- TechMagic "Best Booking Engines for Hotels 2026" — market comparison of booking engine features
- QloApps "Must-Have Hotel Website Features 2026" — industry feature checklist
- Firefly Reservations Guest Portal documentation — guest self-service feature reference
- Cloudbeds "Hotel Website Design Best Practices 2026" — design and UX recommendations
- Mediaboom "Hotel Website Design Trends 2026" — mobile-first, minimalist, immersive visuals
- Fortune Business Insights — e-commerce platform market data
- Hospitality Net "30 Key Trends for 2026" — AI-driven personalization, unified data platforms
