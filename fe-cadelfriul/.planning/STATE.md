# STATE: Ca' Del Friul — Frontend

**Updated:** 2026-07-31 — after quick task 260731-dfc

## Project Reference

- **Core Value:** Guests can explore the resort, discover experiences and products, and manage their bookings and orders from a single, beautiful web application.
- **Current Focus:** Phase 2 — Authentication & Booking
- **Granularity:** Standard

## Current Position

- **Phase:** 1 — Foundation: Scaffold & Static Pages
- **Status:** Completed
- **Progress:** [#####################] 100%

## Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Phase velocity | 1 session | — |
| Requirements coverage | 20/20 (100%) | 100% |
| Plans completed | 6/6 | 6 |

## Accumulated Context

### Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Phase 1 covers all 20 v1 requirements | All v1 items are structural shell + static placeholder pages with zero API dependencies — natural delivery boundary | 2026-07-08 |
| Route groups: `(vetrina)`, `(auth)`; real segment: `dashboard/` | `(dashboard)` conflicted with `(vetrina)` at `/` — moved to real `dashboard/` segment | 2026-07-08 |
| base-nova Button lacks `asChild` prop | Used `buttonVariants()` CSS class on `<Link>` instead of `<Button asChild>` | 2026-07-08 |
| shadcn/ui initialized (New York, neutral stone) | Component library for design consistency across phases | 2026-07-08 |
| Lucide icons + Playfair Display headings | Luxury rustic-chic brand identity | 2026-07-08 |
| Color palette: warm ivory/stone gray/muted gold | 60/30/10 split for luxury rustic-chic | 2026-07-08 |
| Typography: 4 sizes, 2 weights, 2 families | Playfair (headings) + Geist (body), 14/16/24/56px | 2026-07-08 |
| Future phases 2-5 cover v2 requirements | Auth, booking, dashboard live data, e-commerce phases defined but awaiting backend API contracts | 2026-07-08 |

### TODOs

- [x] Phase 1 planned — 6 plans created, verified with 0 blockers
- [x] Phase 1 executed — 17 routes, build passes
- [ ] Next: `/gsd-discuss-phase 02` to plan Authentication & Booking phase

### Blockers

| Blocker | Impact | Status |
|---------|--------|--------|
| Spring Boot API contract undefined | Phase 2-5 cannot define exact API service types or endpoints until the backend team finalizes the REST API | Deferred — not blocking Phase 1 |
| Stripe integration mode unconfirmed | Phase 3 checkout page architecture depends on whether Spring Boot uses Payment Element or Checkout Session | Deferred — needs confirmation before Phase 3 |

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260709-dy1 | Connect Next.js frontend to Spring Boot REST API with JWT Bearer authentication | 2026-07-09 | `521b522` | [260709-dy1-connect-next-js-frontend-to-spring-boot-](./quick/260709-dy1-connect-next-js-frontend-to-spring-boot-/) |
| 260709-emx | Complete User Dashboard integration: Address CRUD, dynamic sidebar, address management page | 2026-07-09 | `751abd1` | [260709-emx-complete-user-dashboard-integration-upda](./quick/260709-emx-complete-user-dashboard-integration-upda/) |
| 260709-fdh | Add centralized toast notification system and refactor profile page with editable fields and save | 2026-07-09 | `2793fa0` | [260709-fdh-add-centralized-toast-notification-syste](./quick/260709-fdh-add-centralized-toast-notification-syste/) |
| 260709-fpa | Verify phone field state initialization in profile page | 2026-07-09 | — | [260709-fpa-analyze-src-app-dashboard-profile-page-t](./quick/260709-fpa-analyze-src-app-dashboard-profile-page-t/) |
| 260709-fxy | Refactor profile page data fetching to use GET /api/customers/{id} for full customer data | 2026-07-09 | `24f1354`, `5cf42cd` | [260709-fxy-refactor-profile-page-data-fetching-to-u](./quick/260709-fxy-refactor-profile-page-data-fetching-to-u/) |
| 260709-ib2 | Implement AuthContext to deduplicate /api/auth/me calls across dashboard | 2026-07-09 | `89d346c`, `34ecc59`, `3f22517` | [260709-ib2-implement-a-react-context-authprovider-u](./quick/260709-ib2-implement-a-react-context-authprovider-u/) |
| 260710-a1b | Unified auth flow: AuthContext cookies, route protection, navigation UI | 2026-07-10 | `7371cf4` | [260710-a1b-auth-flow-unified](./quick/260710-a1b-auth-flow-unified/) |
| 260710-c3d | E-commerce storefront, cart & checkout | 2026-07-10 | — | [260710-c3d-ecommerce-storefront-cart-checkout](./quick/260710-c3d-ecommerce-storefront-cart-checkout/) |
| 260710-b4e | Fix next/image SSRF private IP error for local backend | 2026-07-10 | — | [260710-b4e-fix-next-image-ssrf-private-ip](./quick/260710-b4e-fix-next-image-ssrf-private-ip/) |
| 260710-e2f | Fix SidebarNav hydration mismatch | 2026-07-10 | — | [260710-e2f-fix-sidebar-hydration-mismatch](./quick/260710-e2f-fix-sidebar-hydration-mismatch/) |
| 260710-mwq | Connect orders page to backend API fetch | 2026-07-10 | `29db474`, `b5c5ba1` | [260710-mwq-connect-orders-page-to-backend-api-fetch](./quick/260710-mwq-connect-orders-page-to-backend-api-fetch/) |
| 260716-d8e | Prevent unauthenticated users from adding items to cart and show brand-aligned toast notification | 2026-07-16 | `e21770a` | [260716-d8e-prevent-unauthenticated-users-from-addin](./quick/260716-d8e-prevent-unauthenticated-users-from-addin/) |
| 260722-lsu | Update Rooms & Suites page to fetch live room data from backend API | 2026-07-22 | — | [260722-lsu-update-rooms-suites-page-to-fetch-and-di](./quick/260722-lsu-update-rooms-suites-page-to-fetch-and-di/) |
| 260722-car | Fix product images and add image carousel to Product and Room cards | 2026-07-22 | `0909b2c` | [260722-car-image-carousel](./quick/260722-car-image-carousel/) |
| 260727-fm3 | Fix React Hydration error in Header and enforce cart authentication | 2026-07-27 | `1a0b21a` | [260727-fm3-fix-react-hydration-error-in-the-header-](./quick/260727-fm3-fix-react-hydration-error-in-the-header-/) |
| 260727-g6g | Implement final Stripe Checkout redirect logic | 2026-07-27 | `f062ad4`, `0467feb` | [260727-g6g-implement-final-stripe-checkout-redirect](./quick/260727-g6g-implement-final-stripe-checkout-redirect/) |
| 260727-k36 | Create checkout success page with cart clearing and dashboard redirect | 2026-07-27 | `a1b09da` | [260727-k36-create-checkout-success-page-with-post-p](./quick/260727-k36-create-checkout-success-page-with-post-p/) |
| 260728-kqe | Update frontend for dynamic shipping costs, product stock limits, and checkout error handling | 2026-07-28 | `108202c`, `46bf9fe` | [260728-kqe-update-angular-frontend-for-dynamic-ship](./quick/260728-kqe-update-angular-frontend-for-dynamic-ship/) |
| 260731-dfc | Create a new Next.js customer-facing page for E-Bike Rentals | 2026-07-31 | `7e73953` | [260731-dfc-create-a-new-next-js-customer-facing-pag](./quick/260731-dfc-create-a-new-next-js-customer-facing-pag/) |

## Session Continuity

**What was done:**
- Quick task 260731-dfc: Created customer-facing E-Bike Rentals page at `/experiences/e-bikes` — self-contained `"use client"` page with 3 mock e-bike models (Friuli City Cruiser €29, Collio Trail E-MTB €49, Alpina Premium E-MTB €69), selectable bike cards (accent ring + check badge, image `onError` fallback), date-based booking form with past-date/end-before-start validation, reactive days/total price summary, and mock submit (setTimeout → sonner toast "Booking request sent successfully!" → form reset). Zero new dependencies; commit `7e73953`.
- Quick task 260710-mwq: Connected orders page to backend API — added Order interface and fetchOrders() to API client, rewrote orders page as client component with loading skeletons, error handling, empty state with shop link, and real order data table (orderNumber, date it-IT, status badge, EUR total)
- Quick task 260710-c3d: E-commerce storefront, cart & checkout — created dynamic `/shop` page fetching products from API, created `CartContext` with localStorage persistence, created `/cart` page with quantity controls and order summary, created `/checkout` page with address selection and order placement (auth-gated), updated Header with cart badge and Shop nav link, updated Footer with Shop link, fixed CartContext lint warning using lazy initializer pattern
- Quick task 260710-a1b: Unified auth flow — migrated from localStorage to js-cookie (`accessToken` cookie), expanded AuthContext with `isAuthenticated`, `login()`, `logout()`, wrapped root layout with `<AuthProvider>`, added conditional Sign In/My Dashboard/Logout to Header, wired login page to use context, added "Back to Shop" link and context-based logout to dashboard sidebar, created `src/proxy.ts` (Next.js 16) for route protection on `/dashboard/*` and auth redirect
- Quick task 260709-ib2: Created `AuthContext` with `AuthProvider` (calls `fetchProfile` once) and `useAuth` hook. Wrapped dashboard layout with `<AuthProvider>`. SidebarNav now consumes `useAuth()` instead of calling `fetchProfile` locally. Profile page gets `user.id` from `useAuth()` and fetches customer details via `fetchCustomerDetails(id)`. Removed duplicate `/api/auth/me` calls.
- Quick task 260709-fxy: Added `CustomerDetails` interface (phone required) and `fetchCustomerDetails()` to API client. Refactored profile page to chain `fetchProfile()` → `fetchCustomerDetails(id)` with cancelled-guard pattern for safe async two-step fetch. Phone now sourced from guaranteed `CustomerDetails.phone`.
- Quick task 260709-fpa: Verified profile page phone field — state init (`useState("")`), API extraction (`setPhone(u.phone ?? "")`), input binding (`value={phone}` + `onChange`), and `npx tsc --noEmit` all confirmed correct. No code changes needed.
- Quick task 260709-fdh: Installed shadcn sonner, added `<Toaster />` to root layout with rustic-chic theme. Added `phone?: string` to `UserResponse`, created `UpdateProfileRequest` interface and `updateProfile()` function. Refactored profile page with controlled First Name/Last Name/Phone inputs, save handler, and toast on success/error.
- Quick task 260709-emx: Extended API client with Address CRUD types/functions (`fetchAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, `setDefaultShipping`), wired SidebarNav to show real user data with dynamic initials, implemented full Addresses page with list/add/edit/delete/set-default-shipping
- Quick task 260709-dy1: Created typed API client (`src/lib/api.ts`) with Bearer token auth, wired up login page with form state and API call, wired up dashboard/profile page with real data fetching, and connected logout button
- API client uses `localStorage` for JWT Bearer token, with 401/403 auto-redirect to `/login`
- Phase 1 fully executed: 6 plans, 3 waves, all 20 v1 requirements covered
- Wave 1: Theme tokens + Playfair font + metadata (01-01); shadcn card/input/label/skeleton/separator (01-02)
- Wave 2: (vetrina) layout, Header, Footer, HeroSection, Rooms page with RoomCard, error/loading/not-found
- Wave 3: Experiences, Products, About, Contact pages (01-04); Auth route group with login/register/reset (01-05); Dashboard with sidebar + 5 pages (01-06)
- 17 static routes generated, build passes with no errors

**Key fixes during execution:**
- base-nova Button doesn't support `asChild` — used `buttonVariants()` class on `<Link>` instead
- `(dashboard)` route group conflicted with `(vetrina)` at `/` — moved to real `dashboard/` segment
- `"use client"` added to contact page (onSubmit handler)

**Last activity:** 2026-07-31 — Completed quick task 260731-dfc: Create a new Next.js customer-facing page for E-Bike Rentals

**Next recommended step:**
- Test e-commerce flow end-to-end with backend API (stock limits + shipping cost calculation)
- Consider adding payment gateway integration for checkout

**Relevant context for next session:**
- Quick task 260731-dfc: `/experiences/e-bikes` live and static-prerendered — 3 mock e-bikes, selectable cards, date validation, reactive price summary, mock booking submit (toast + reset). `handleBook` handler is the seam for the Phase 3 booking engine/API. Note: lucide-react 1.23 exports `Bike` (not `Bicycle`).
- 20 v1 requirements structurally complete — all placeholder pages in place
- Quick task 260710-c3d: E-commerce implemented — `/shop` fetches products from API, `/cart` with quantity controls, `/checkout` with address selection and order placement (auth-gated), CartContext provides `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `cartTotal`, `itemCount` with localStorage persistence
- Quick task 260710-mwq: Orders page connected to backend — Order interface and fetchOrders() added to API client, orders page fetches real data from GET /api/orders with loading skeletons, error handling, empty state with shop link
- Quick task 260709-ib2: Created `AuthContext.tsx` with `AuthProvider` (single `fetchProfile` call) and `useAuth` hook. DashboardLayout wraps with `<AuthProvider>`. SidebarNav and profile page both consume `useAuth()` instead of calling `fetchProfile` independently. Profile page fetches customer details via `fetchCustomerDetails(id)` from context-provided `user.id`.
- Quick task 260709-emx: Address CRUD types and 5 functions added to API client, SidebarNav now shows real user data, Addresses page has full CRUD against `/api/customers/{customerId}/addresses`
- Quick task 260709-fxy: Added `CustomerDetails` interface (phone required) and `fetchCustomerDetails()` to API client. Profile page now chains `fetchProfile()` → `fetchCustomerDetails(id)` with cancelled-guard to get guaranteed phone field.
- Quick task 260709-fdh: Sonner toast added to root layout, `phone` field and `updateProfile` function added to API client, profile page now editable with save-toast feedback
- Quick task 260727-fm3: Fixed Header hydration error via isMounted pattern, added auth protection to cart page (redirect unauthenticated users, clear cart localStorage), added cart clearing on logout in AuthContext, fixed pre-existing ProductCard.tsx missing "use client" directive
- Quick task 260728-kqe: Added stockQuantity to Product interface, stock-aware CartContext with quantity capping and getMaxQuantity helper, stock-aware Shop page with low stock warnings and Out of Stock/Max in Cart button states, dynamic shipping cost display in Cart and Checkout pages, shipping cost fetched from backend per address selection in Checkout, granular checkout error handling parsing stock/address/product keywords from backend responses
- Phase 2 will add route protection, registration/reset-password flows, and booking form
- Spring Boot API contract is partially known (login/me/addresses endpoints confirmed) — Stripe integration mode still unconfirmed
- `components.json` has base-nova preset (New York, neutral, RSC enabled)
