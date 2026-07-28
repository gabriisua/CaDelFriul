# Roadmap: Ca' Del Friul — Frontend

**Core Value:** Guests can explore the resort, discover experiences and products, and manage their bookings and orders from a single, beautiful web application.

**Granularity:** Standard
**Created:** 2026-07-08

## Phases

- [ ] **Phase 1: Foundation — Scaffold & Static Pages** — Route groups, Tailwind theme, metadata, boundaries, and all static placeholder pages across showcase, auth, and dashboard contexts.
- [ ] **Phase 2: Auth & API Integration** — JWT authentication flow (HttpOnly cookies) and typed Spring Boot API service layer.
- [ ] **Phase 3: Booking Engine** — Room availability search, multi-step booking flow, payment via Stripe (embedded Payment Element).
- [ ] **Phase 4: Customer Dashboard — Live Data** — Live order/reservation history, profile editing, wishlist management.
- [ ] **Phase 5: Hybrid E-commerce** — Unified cart (rooms + experiences + products), product checkout flow, gift vouchers.

## Phase Details

### Phase 1: Foundation — Scaffold & Static Pages
**Goal**: The complete structural shell is built — all three route groups with layouts, the luxury rustic-chic theme applied, and static placeholder pages for every section of the application. The app is navigable end-to-end with proper error boundaries.
**Depends on**: Nothing (existing Next.js scaffold)
**Requirements**: SCFLD-01, SCFLD-02, SCFLD-03, SCFLD-04, SCFLD-05, SCFLD-06, VETR-01, VETR-02, VETR-03, VETR-04, VETR-05, VETR-06, AUTH-01, AUTH-02, AUTH-03, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate the public showcase (Home, Rooms, Experiences, Products, About, Contact) with consistent Header/Footer on every page
  2. Login, registration, and password-reset pages render in a clean, distraction-free layout without public Header/Footer chrome
  3. Dashboard pages (Profile, Addresses, Orders, Reservations) are accessible with persistent Sidebar navigation and responsive layout
  4. All pages display the luxury rustic-chic theme (olive greens, stone grays, muted golds) consistently using Tailwind `@theme` tokens
  5. Errors, slow loads, and 404s are handled gracefully per route group with context-appropriate feedback pages
  6. Site metadata (title, description, icons) reflects "Ca' Del Friul — Premium Italian Resort" instead of Create Next App boilerplate
**Plans**: 6 plans in 3 waves (Wave 1: plans 01-02 parallel; Wave 2: plan 03; Wave 3: plans 04-06 parallel)
**UI hint**: yes

Plans:
- [ ] 01-01-PLAN.md — Theme & Root Infrastructure (brand colors, Playfair font, metadata)
- [ ] 01-02-PLAN.md — shadcn UI Dependencies (card, input, label, skeleton, separator)
- [ ] 01-03-PLAN.md — (vetrina) Layout + Home + Rooms + error boundaries
- [ ] 01-04-PLAN.md — (vetrina) Experiences + Products + About + Contact
- [ ] 01-05-PLAN.md — (auth) Route Group with AuthLayout + 3 auth pages + boundaries
- [ ] 01-06-PLAN.md — (dashboard) Route Group with SidebarNav + 5 pages + boundaries

### Phase 2: Auth & API Integration
**Goal**: Users can securely register, log in, and access protected routes. The frontend communicates with Spring Boot via a typed API service layer using JWT bearer tokens stored in HttpOnly cookies.
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. User can register a new account and log in with email/password against the Spring Boot API
  2. User session persists across browser tabs and restarts via HttpOnly cookie (no localStorage tokens)
  3. Unauthenticated users are redirected from protected dashboard routes to the login page
  4. Typed API service functions (`@/lib/services/`) provide consistent error handling for all Spring Boot endpoints
  5. User can log out, which clears the session cookie and redirects to the home page
**Plans**: TBD

### Phase 3: Booking Engine
**Goal**: Guests can search room availability by date, view pricing, and complete a multi-step booking flow with secure payment. The booking state machine (IDLE → HOLD → PAYMENT → CONFIRMED) is fully functional.
**Depends on**: Phase 2
**Requirements**: (to be defined — booking engine and payment flow requirements)
**Success Criteria** (what must be TRUE):
  1. Guest can search room availability by check-in/check-out dates and guest count using a date range picker
  2. Guest completes a multi-step booking flow: date selection → room choice → guest info → payment → confirmation
  3. Guest sees a real-time countdown timer reflecting the 15-minute inventory hold window during checkout
  4. Guest receives a booking confirmation page with summary, reference number, and next-steps information
  5. Prices are re-fetched from the API at checkout (never from client-side cache) to prevent price staleness
**Plans**: TBD

### Phase 4: Customer Dashboard — Live Data
**Goal**: Customers can view their real reservations and order history, manage their profile, and save items to a wishlist. The dashboard is no longer static — it surfaces live data from the Spring Boot API.
**Depends on**: Phase 2, Phase 3
**Requirements**: (to be defined — dashboard live data and profile management requirements)
**Success Criteria** (what must be TRUE):
  1. Customer can view their real reservation history with status, dates, and details
  2. Customer can view their real order history with status, items, and tracking
  3. Customer can edit their profile (name, email, phone, preferences) and changes persist
  4. Customer can manage saved addresses in their address book
  5. Customer can add/remove items from a wishlist and see saved items across sessions
**Plans**: TBD

### Phase 5: Hybrid E-commerce
**Goal**: Customers can purchase resort merchandise and products through a dedicated checkout flow. The platform supports a unified cart view that separates booking items (rooms, experiences) from commerce items (products) but presents them in a single, cohesive interface.
**Depends on**: Phase 3
**Requirements**: CART-01, CART-02, CART-03, CART-04
**Success Criteria** (what must be TRUE):
  1. Customer can add products to a shopping cart and review cart contents with quantities and pricing
  2. Customer completes a product checkout flow with shipping address, delivery method, and payment
  3. Unified cart view displays both booking items and product items with two visually separate checkout paths
  4. Guest cart is persisted (encrypted cookie) and seamlessly merges into the customer account upon login
  5. Customer can purchase gift vouchers as a digital product with recipient details
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Scaffold & Static Pages | 0/6 | Planned | - |
| 2. Auth & API Integration | 0/0 | Not started | - |
| 3. Booking Engine | 0/0 | Not started | - |
| 4. Customer Dashboard — Live Data | 0/0 | Not started | - |
| 5. Hybrid E-commerce | 0/0 | Not started | - |

---

*Roadmap created: 2026-07-08*
