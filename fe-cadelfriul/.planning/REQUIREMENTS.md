# Requirements: Ca' Del Friul — Frontend

**Defined:** 2026-07-08
**Core Value:** Guests can explore the resort, discover experiences and products, and manage their bookings and orders from a single, beautiful web application.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Scaffold & Route Groups

- [ ] **SCFLD-01**: Route group `(vetrina)` created with Header and Footer layout
- [ ] **SCFLD-02**: Route group `(auth)` created with clean, distraction-free layout
- [ ] **SCFLD-03**: Route group `(dashboard)` created with Sidebar navigation layout
- [ ] **SCFLD-04**: Luxury rustic-chic Tailwind CSS theme (olive greens, stone grays, muted golds)
- [ ] **SCFLD-05**: Update root layout metadata from "Create Next App" boilerplate
- [ ] **SCFLD-06**: Error, loading, and not-found boundaries per route group

### Public Showcase (Vetrina)

- [ ] **VETR-01**: Home/Landing page with hero section and immersive visuals
- [ ] **VETR-02**: Rooms & Suites page with gallery and amenity info (static)
- [ ] **VETR-03**: Experiences & Activities page (static)
- [ ] **VETR-04**: Products / Merchandise page (static)
- [ ] **VETR-05**: About / Heritage storytelling page
- [ ] **VETR-06**: Contact & Location page with map and details

### Authentication

- [ ] **AUTH-01**: Login page with email/password form (static placeholder)
- [ ] **AUTH-02**: Registration page with sign-up form (static placeholder)
- [ ] **AUTH-03**: Password reset page with request form (static placeholder)

### Customer Dashboard

- [ ] **DASH-01**: Dashboard base layout with Sidebar navigation
- [ ] **DASH-02**: Profile page (view/edit profile placeholder)
- [ ] **DASH-03**: Addresses page (address book placeholder)
- [ ] **DASH-04**: Orders page (order history placeholder)
- [ ] **DASH-05**: Reservations page (reservation history placeholder)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Shopping Engine

- **CART-01**: Unified cart (rooms + experiences + products)
- **CART-02**: Booking checkout flow (date range, guest info, payment)
- **CART-03**: E-commerce checkout flow (shipping, payment)
- **CART-04**: Wishlist / saved items

### API Integration

- **API-01**: Spring Boot REST API service layer
- **API-02**: JWT auth with HttpOnly cookies
- **API-03**: Real data fetching for all pages

### Premium Features

- **PREMIUM-01**: Dynamic packaging / bundles
- **PREMIUM-02**: Guest self-service portal
- **PREMIUM-03**: Gift vouchers
- **PREMIUM-04**: Multi-language support (Italian, English, German)
- **PREMIUM-05**: Virtual tour / 360° rooms

## Out of Scope

| Feature | Reason |
|---------|--------|
| Admin dashboard | Backend/separate system concern |
| Real-time chat | Premature; deferred to Phase 4+ |
| Social login (OAuth) | JWT auth already decided; marginal gain |
| PMS integration | Backend responsibility |
| OTA channel management | Backend infrastructure |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCFLD-01 | Phase 1 | Pending |
| SCFLD-02 | Phase 1 | Pending |
| SCFLD-03 | Phase 1 | Pending |
| SCFLD-04 | Phase 1 | Pending |
| SCFLD-05 | Phase 1 | Pending |
| SCFLD-06 | Phase 1 | Pending |
| VETR-01 | Phase 1 | Pending |
| VETR-02 | Phase 1 | Pending |
| VETR-03 | Phase 1 | Pending |
| VETR-04 | Phase 1 | Pending |
| VETR-05 | Phase 1 | Pending |
| VETR-06 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| DASH-04 | Phase 1 | Pending |
| DASH-05 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-08*
*Last updated: 2026-07-08 after initial definition*
