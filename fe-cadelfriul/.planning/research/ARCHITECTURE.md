# Architecture Patterns: Hybrid Resort Booking & E-commerce

**Domain:** Resort booking + e-commerce (Next.js + Spring Boot)
**Researched:** 2026-07-08
**Confidence:** HIGH (verified across multiple production-grade references)

---

## Executive Summary

The 2026 industry standard for hybrid resort booking/e-commerce platforms is **headless/composable architecture** — the presentation layer (Next.js App Router) is fully decoupled from the backend (Spring Boot REST API). They communicate exclusively via typed API contracts.

The key architectural insight from every production reference: **separate the read path from the write path.** The read path (search, browsing, showcase) can be eventually consistent, cached, and fast. The write path (bookings, payments, orders) must be strongly consistent and transaction-safe. These two paths share only the Spring Boot API as the source of truth.

The Next.js frontend acts as a **Backend for Frontend (BFF)** — the browser never talks to Spring Boot directly. Next.js handles rendering, authentication, session management, and API orchestration. This eliminates CORS in production and keeps JWT tokens in HttpOnly cookies.

---

## Table of Contents

1. [System-Level Architecture](#1-system-level-architecture)
2. [Component Boundaries](#2-component-boundaries)
3. [Data Flow](#3-data-flow)
4. [Route Architecture](#4-route-architecture)
5. [Authentication Architecture](#5-authentication-architecture)
6. [State Management Strategy](#6-state-management-strategy)
7. [E-commerce Cart Architecture](#7-e-commerce-cart-architecture)
8. [Booking Flow Architecture](#8-booking-flow-architecture)
9. [CMS & Content Layer](#9-cms--content-layer)
10. [Scalability Considerations](#10-scalability-considerations)
11. [Build Order & Dependencies](#11-build-order--dependencies)
12. [References & Sources](#12-references--sources)

---

## 1. System-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                             │
│              ┌─────────────┐  ┌──────────┐  ┌──────────┐            │
│              │  (vetrina)   │  │  (auth)  │  │(dashboard)│           │
│              │  Public UI   │  │  Auth UI │  │  App UI  │            │
│              └──────┬───────┘  └────┬─────┘  └────┬─────┘            │
│                     │               │              │                  │
└─────────────────────┼───────────────┼──────────────┼──────────────────┘
                      │               │              │
                      ▼               ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js Server (BFF Layer)                       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    Middleware (proxy.ts)                      │     │
│  │  • Route protection (gate on session)                       │     │
│  │  • Property/domain resolution                               │     │
│  │  • JWT refresh on proxied requests                          │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Server        │  │ Client        │  │ Server        │              │
│  │ Components    │  │ Components    │  │ Actions       │              │
│  │ (RSC - auth)  │  │ ("use client")│  │ (form handler)│              │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘               │
│         │                                    │                        │
│         └──────────────┬─────────────────────┘                        │
│                        ▼                                              │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    API Service Layer                          │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │     │
│  │  │ Auth     │ │ Booking  │ │ Product  │ │ CMS      │        │     │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │        │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │     │
│  └─────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Spring Boot REST API (Backend)                     │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Auth     │ │ Booking  │ │ Product  │ │ Customer │ │ Payment  │  │
│  │ Module   │ │ Module   │ │ Catalog  │ │ Module   │ │ Module   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                              │
│  │ Inventory│ │ Search   │ │ CMS/     │                              │
│  │ Service  │ │ Service  │ │ Content  │                              │
│  └──────────┘ └──────────┘ └──────────┘                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                   PostgreSQL Database                         │     │
│  │  (Transactions: bookings, payments, orders — strong            │     │
│  │   consistency, exclusion constraints for date-range booking)   │     │
│  └─────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

| Decision | Rationale | Source |
|----------|-----------|--------|
| Next.js as BFF proxy | Browser never touches Spring Boot directly; JWT stays in HttpOnly cookies; eliminates CORS in production | AWS Hospitality Architecture, SmartServe AI, DevOps.pro |
| Separate read/write paths | Search/catalog reads cached and eventually consistent; booking/payment writes strongly consistent | Hotel Reservation HLD Handbook, Airbnb Architecture Analysis |
| Route Groups for UX contexts | Each group has its own layout, middleware behavior, and component tree — clean separation | Next.js 16 Project Structure best practices |
| Spring Boot owns all transactional logic | Frontend is a rendering layer only; backend is source of truth for inventory, pricing, reservations | Multiple production Spring Boot + Next.js projects |

---

## 2. Component Boundaries

### 2.1 Full Component Map

| Component | Responsibility | Communicates With | Server/Client |
|-----------|---------------|-------------------|---------------|
| **Root Layout** | HTML shell, fonts, CSS variables, metadata | None (config only) | Server |
| **(vetrina) Layout** | Header, Footer for public marketing pages | Public content data | Server |
| **(vetrina) Pages** | Home, Experiences, Products, Room showcase, About, Contact | CMS Service, Product Service | Server (RSC) |
| **(auth) Layout** | Minimal/clean layout for login/registration | None (config only) | Server |
| **(auth) Pages** | Login, Register, Forgot Password, Reset Password | Auth Service | Mixed (form = client) |
| **(dashboard) Layout** | Sidebar, TopBar, user context | Auth Service, Customer Service | Server |
| **(dashboard) Pages** | Profile, Bookings, Orders, Favorites, Settings | Booking Service, Order Service, Customer Service | Mixed |
| **API Service Layer** (`@/lib/services/`) | Typed HTTP client wrappers for Spring Boot endpoints | Spring Boot REST API | Both (server fetch + client fetch) |
| **Auth Context/Provider** | JWT session hydration, token refresh, user state | Auth Service, Middleware | Client (`"use client"`) |
| **Booking Calendar** | Date range picker with availability overlay | Booking Service (availability API) | Client |
| **Cart Drawer** | E-commerce cart overlay | Product Service (server action) | Client |
| **Middleware (proxy.ts)** | Route protection, token refresh, property resolution | Auth Service (token validation) | Edge |
| **Server Actions** | Form handlers for booking, cart, checkout mutations | Booking Service, Order Service, Payment Service | Server |
| **CMS Integration** | Fetch structured content (room descriptions, experiences, SEO metadata) | Spring Boot CMS API or external CMS | Server (RSC) |

### 2.2 Component Boundary Rules

**Rule 1: Server Components are the default.** Every page and layout is a Server Component unless interactivity requires otherwise. Client boundaries are explicit via `"use client"`.

**Rule 2: Client components are leaves, not branches.** A client component should not contain server components. The boundary exists where interactivity begins (calendar, cart, forms).

**Rule 3: Data fetching happens in Server Components.** Client components receive data as props — they do not fetch. Server Actions handle mutations.

**Rule 4: The API Service Layer is shared.** Service functions are called from Server Components (server-side fetch) and Server Actions. Client components call them only through Server Actions, never directly.

```
┌─────────────────────────────────────────────┐
│  Server Component (page.tsx)                 │
│  fetches data via service layer              │
│  renders HTML                                │
│  ┌───────────────────────────────────────┐   │
│  │  Client Component (calendar.tsx)       │   │
│  │  receives `availability` as prop       │   │
│  │  handles date selection interactivity  │   │
│  │  calls Server Action on submit         │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 3. Data Flow

### 3.1 Primary Request Path (Page Load)

```
1. HTTP request → Next.js server
2. Middleware (proxy.ts) runs:
   a. Resolves route group context (vetrina/auth/dashboard)
   b. Checks session cookie for (dashboard) or (auth) routes
   c. Refreshes JWT if needed
3. Route handler matches page.tsx in appropriate route group
4. Server Component renders:
   a. Calls API Service Layer (fetches from Spring Boot)
   b. Layout component wraps page
   c. Returns HTML + RSC payload to browser
5. Browser paints HTML immediately
6. Client components hydrate (minimal JS)
```

### 3.2 Data Fetching Patterns

| Pattern | Use Case | Implementation |
|---------|----------|---------------|
| **SSR (Server-side render)** | Booking flow, dashboard, auth — needs fresh data on every request | `fetch()` in Server Component with `cache: "no-store"` |
| **ISR (Incremental Static Regeneration)** | Room pages, experience pages, content pages — updates via webhook | `fetch()` with `next: { revalidate: 3600 }` or `unstable_cache` |
| **SSG (Static Generation)** | Static marketing pages, FAQ, policies — rarely changes | `fetch()` at build time (default with no dynamic functions) |
| **Server Action** | Form submissions (book, add to cart, login) — mutations | `"use server"` function called from client component |
| **Edge fetch** | Availability lookups — needs low latency | Middleware or Edge Function caching |

### 3.3 Read Path (Search / Browsing)

```
User searches rooms
        │
        ▼
Next.js Server Component
        │
        ▼
API Service Layer (GET /api/rooms/availability?dates=...)
        │
        ▼
Spring Boot: READ from PostgreSQL (or cached Redis)
        │
        ▼
Response → Server Component renders availability grid
        │
        ▼
Optional: Client Calendar component hydrates for interactivity
```

**Key rule:** Search results can be **eventually consistent**. If a room sold between search and booking, the booking step catches it with a real-time check.

### 3.4 Write Path (Booking / Order)

```
User clicks "Book Now" or "Add to Cart"
        │
        ▼
Client component → Server Action
        │
        ▼
Step 1: Create pending booking record
  → POST /api/bookings (Spring Boot)
  → Returns booking_id with status: PENDING
        │
        ▼
Step 2: Lock inventory (temporary hold)
  → PUT /api/inventory/hold (within same transaction or saga step)
  → If unavailable: abort with "sorry, just sold"
        │
        ▼
Step 3: Authorize payment (if applicable)
  → POST /api/payments/authorize (Stripe via Spring Boot)
  → Stripe holds funds (capture_method=manual for bookings)
        │
        ▼
Step 4: Confirm booking
  → PUT /api/bookings/{id}/confirm
  → Spring Boot transitions status: PENDING → CONFIRMED
  → Inventory permanently reduced
        │
        ▼
Step 5: Revalidate (Next.js)
  → revalidatePath('/rooms') to update cached availability
```

### 3.5 Auth Data Flow

```
Login
  │
  ▼
Client form → Server Action
  │
  ▼
POST /api/auth/login (Spring Boot)
  │
  ▼
Backend returns { accessToken, refreshToken, expiresAt }
  │
  ▼
Server Action sets HttpOnly cookies:
  - session_token (refresh token, long-lived)
  - (access token stored server-side or in encrypted cookie)
  │
  ▼
Redirect to dashboard or previous page
```

```
Subsequent Request
  │
  ▼
Middleware reads session_token cookie
  │
  ▼
If access token expired:
  POST /api/auth/refresh with refresh_token
  → New access token stored
  │
  ▼
Request forwarded to Spring Boot with Authorization header
```

---

## 4. Route Architecture

### 4.1 Current & Planned Route Structure

```
src/app/
├── layout.tsx                          # Root layout (fonts, HTML shell, globals.css)
├── page.tsx                            # Home page (within (vetrina) context — moved later)
├── globals.css                         # Tailwind v4 + CSS custom properties
├── favicon.ico
│
├── (vetrina)/                          # PUBLIC: Marketing showcase
│   ├── layout.tsx                      # Public header + footer, SEO metadata
│   ├── page.tsx                        # / (Home page — moved here from root)
│   ├── esperienze/
│   │   └── [slug]/page.tsx             # /esperienze/nome-esperienza
│   ├── prodotti/
│   │   ├── page.tsx                    # /prodotti (product catalog)
│   │   └── [slug]/page.tsx             # /prodotti/nome-prodotto
│   ├── camere/
│   │   └── [slug]/page.tsx             # /camere/nome-camera
│   └── chi-siamo/page.tsx              # /chi-siamo
│
├── (auth)/                             # AUTH: Clean, distraction-free
│   ├── layout.tsx                      # Minimal layout (no header/footer)
│   ├── login/page.tsx                  # /login
│   ├── registrazione/page.tsx          # /registrazione
│   └── password-dimenticata/page.tsx   # /password-dimenticata
│
├── (dashboard)/                        # PRIVATE: Customer management
│   ├── layout.tsx                      # Sidebar + top navigation, user context
│   ├── dashboard/
│   │   └── page.tsx                    # /dashboard (home — upcoming bookings, etc.)
│   ├── prenotazioni/
│   │   └── page.tsx                    # /prenotazioni (my bookings)
│   ├── ordini/
│   │   └── page.tsx                    # /ordini (my orders)
│   ├── profilo/
│   │   └── page.tsx                    # /profilo (profile settings)
│   └── preferiti/
│       └── page.tsx                    # /preferiti (favorites)
│
└── api/                                # (Deferred to Phase 2+)
    └── proxy/[...path]/route.ts        # Optional: BFF proxy to Spring Boot
```

### 4.2 Route Group Strategy

| Group | URL Prefix | Layout | Auth Required | Rendering Strategy |
|-------|-----------|--------|---------------|--------------------|
| `(vetrina)` | None (root paths) | Public Header + Footer | No | Mostly ISR/SSR |
| `(auth)` | `/login`, `/registrazione` | Minimal (no nav) | No (redirect if logged in) | SSR |
| `(dashboard)` | `/dashboard`, `/prenotazioni` | Sidebar + User bar | Yes | SSR (fresh data always) |

### 4.3 Middleware Route Protection

```typescript
// src/middleware.ts (proxy.ts in Next.js 16)
// Pattern: gate on session cookie, redirect to /login if missing
// Use createRouteMatcher pattern from Clerk/NextAuth examples

const publicRoutes = createRouteMatcher([
  '/',
  '/esperienze(.*)',
  '/prodotti(.*)',
  '/camere(.*)',
  '/chi-siamo',
  '/login',
  '/registrazione',
  '/password-dimenticata',
]);

const authRoutes = createRouteMatcher([
  '/login',
  '/registrazione',
]);

export default async function middleware(request: NextRequest) {
  const session = request.cookies.get('session_token');
  
  // Redirect authenticated users away from auth pages
  if (authRoutes(request) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login
  if (!publicRoutes(request) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

---

## 5. Authentication Architecture

### 5.1 JWT Token Strategy

**Pattern: BFF proxy with HttpOnly cookies** (industry standard for Next.js + Spring Boot JWT)

```
┌───────────────────────────────────────────────────────┐
│                    Browser                              │
│  Cookie: session_token (HttpOnly, Secure, SameSite)    │
│  Cookie: access_token  (HttpOnly, Secure, SameSite)    │
│  — JavaScript NEVER reads these                        │
└───────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│  Middleware (proxy.ts) / Server Action                  │
│  • Reads cookies                                       │
│  • If access_token expired → calls /auth/refresh       │
│  • Attaches Authorization header to proxied requests   │
│  • Returns new cookies if refreshed                    │
└───────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│  Spring Boot                                           │
│  • Validates JWT on every request                      │
│  • Issues access tokens (15 min TTL)                   │
│  • Issues refresh tokens (14 day TTL, rotatable)      │
└───────────────────────────────────────────────────────┘
```

### 5.2 Token Lifecycle

| Token | TTL | Storage | Rotation |
|-------|-----|---------|----------|
| Access Token | 15 minutes | HttpOnly cookie or server memory | New on every refresh |
| Refresh Token | 14 days | HttpOnly cookie + DB (Spring Boot) | Rotated on use (old revoked) |

### 5.3 Login Flow Detail

```
1. User submits email + password via form (client component)
2. Server Action receives credentials
3. Server Action calls POST /api/auth/login on Spring Boot
4. Spring Boot validates credentials, returns { accessToken, refreshToken }
5. Server Action sets cookies:
   - access_token: { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 900 }
   - session_token: { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1209600 }
6. Server Action returns success → client redirects to /dashboard
```

### 5.4 Auth API Endpoints (Expected from Spring Boot)

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/auth/login` | POST | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `/api/auth/register` | POST | `{ name, email, password }` | `{ accessToken, refreshToken, user }` |
| `/api/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `/api/auth/logout` | POST | `{ refreshToken }` | `204 No Content` |
| `/api/auth/me` | GET | — | `{ user }` (requires valid access token) |

---

## 6. State Management Strategy

### 6.1 State Categories

| Category | Where It Lives | Technology | Example |
|----------|---------------|------------|---------|
| **Server data** | Server Component | `fetch()` or service call | Product list, room details, orders |
| **Auth session** | HttpOnly cookies | Cookie parsing in middleware + Server Actions | Current user, tokens |
| **UI state** | Client component | `useState`, `useReducer` | Accordion open/closed, tab selection |
| **Form state** | Client component | React Hook Form / native form APIs | Booking form, checkout |
| **Cart (anonymous)** | Encrypted HttpOnly cookie | Server Actions + cookie read/write | Cart items, quantities |
| **Cart (authenticated)** | Spring Boot DB | Server Actions + API calls | Same as cookie but persisted |
| **Server mutations** | Server Actions | Server Action function | Add to cart, book, cancel order |
| **Cache** | Next.js data cache | `fetch` cache options, `unstable_cache`, `revalidatePath` | ISR pages |

### 6.2 Anti-Patterns to Avoid

- ❌ **Global state store (Zustand/Redux) for server data** — Server Components already handle this. Adding a store creates sync problems.
- ❌ **Storing JWT in localStorage** — XSS vulnerability. HttpOnly cookies only.
- ❌ **Client-side fetching as default** — Lose SSR/SEO benefits. Fetch in Server Components, pass down.
- ❌ **Prop drilling auth state** — Use cookies and middleware, not React Context for auth (unless client needs it for optimistic UI).

### 6.3 When to Use Client-Side State (Sparingly)

- Shopping cart optimistic UI (show item immediately, confirm with Server Action)
- Booking calendar interactions (date selection, month navigation)
- Form field values (before submission)
- UI toggles (mobile menu, accordion panels)

---

## 7. E-commerce Cart Architecture

**Pattern: Encrypted cookie for anonymous users, database-backed for authenticated users.**

```
Anonymous User                    Authenticated User
        │                                │
        ▼                                ▼
┌──────────────────┐           ┌──────────────────────┐
│ Encrypted Cookie  │           │  Spring Boot DB       │
│ { items: [...] }  │           │  cart_items table     │
│ httpOnly: true    │           │  user_id → items      │
│ maxAge: 30 days   │           │  persisted across     │
└────────┬─────────┘           │  sessions/devices     │
         │                     └──────────┬───────────┘
         │                                │
         └──────────┬─────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Server Actions      │
         │  • addToCart         │
         │  • removeFromCart    │
         │  • updateQuantity    │
         │  • getCart           │
         └─────────────────────┘
```

### 7.1 Cart Merge on Login

```
When user logs in:
1. Read anonymous cart from cookie
2. POST /api/cart/merge with { items: [...] }
3. Spring Boot merges cookie items with existing DB cart:
   - Same product: sum quantities
   - New product: append
   - Clear cookie after merge
4. Return merged cart to render in UI
```

### 7.2 Cart API Endpoints (Expected from Spring Boot)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/cart` | GET | Required | Get current user's cart |
| `/api/cart/items` | POST | Required | Add item |
| `/api/cart/items/{id}` | PUT | Required | Update quantity |
| `/api/cart/items/{id}` | DELETE | Required | Remove item |
| `/api/cart/merge` | POST | Required | Merge anonymous cart |
| `/api/cart/clear` | DELETE | Required | Clear entire cart |

---

## 8. Booking Flow Architecture

### 8.1 Booking as a State Machine

A booking is **not a transaction** — it is a state machine. Every status transition has side effects.

```
                    ┌──────────┐
                    │  IDLE    │
                    └────┬─────┘
                         │ User selects dates + room
                         ▼
                    ┌──────────┐
              ┌─────│  HOLD   │◄──── 12-15 min TTL
              │     │(pending)│      auto-releases if
              │     └────┬─────┘      not confirmed
              │          │ User submits booking
              │          ▼
              │     ┌──────────┐
              │     │PAYMENT   │
              │     │PROCESSING│
              │     └────┬─────┘
              │          │ Payment succeeds
              │          ▼
              │     ┌──────────┐
              │     │CONFIRMED │────► Inventory reduced
              │     └──────────┘     Email sent
              │                      PMS notified
              │
              │     ┌──────────┐
              └────►│CANCELLED │
                    └──────────┘     Inventory released
                                     Refund processed
```

### 8.2 Hold + Double-Booking Prevention

**Critical pattern: Two-phase inventory locking.**

```
Phase 1 (when user enters checkout):
  → POST /api/bookings/hold
  → Spring Boot reserves inventory for 15 minutes
  → Returns hold_id + expires_at
  → If inventory unavailable: return error immediately

Phase 2 (when user confirms payment):
  → POST /api/bookings/confirm (with hold_id)
  → Spring Boot checks hold still valid
  → Commits booking, reduces inventory permanently
  → If hold expired: return error (user must restart)
```

**Double-booking prevention on backend (Spring Boot responsibility):**
- PostgreSQL exclusion constraint on `(room_id, daterange(check_in, check_out))` — the **only** bulletproof approach
- Row-level locking (`SELECT ... FOR UPDATE`) on inventory rows
- Optimistic locking with version column for high-contention scenarios

### 8.3 Booking API Endpoints (Expected from Spring Boot)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/rooms/availability` | GET | No | Check availability for date range |
| `/api/rooms/{id}` | GET | No | Room details, rates, amenities |
| `/api/bookings/hold` | POST | Required | Create temporary hold |
| `/api/bookings/confirm` | POST | Required | Confirm booking (payment done) |
| `/api/bookings/{id}` | GET | Required | Get booking details |
| `/api/bookings/{id}/cancel` | PUT | Required | Cancel booking |
| `/api/bookings/my` | GET | Required | User's booking history |

---

## 9. CMS & Content Layer

### 9.1 Content Architecture

For a premium resort website, the content layer is critical. Two approaches were evaluated:

| Approach | Pros | Cons | Recommendation |
|----------|------|------|---------------|
| **Content in Spring Boot** | Single backend, no extra infra | Spring is not a CMS — editorial workflow is limited, no visual editing | Acceptable for MVP |
| **External Headless CMS** (Sanity/Strapi) | Visual editing, content scheduling, multi-language, preview environments | Additional service to manage, extra latency | Recommended for Phase 2+ |
| **Static content in code** | Simplest, fastest | Requires dev for every content change | Only for initial scaffolding |

**Recommended:**
- **Phase 1 (scaffold):** Content as data in Spring Boot (API-driven)
- **Phase 2+:** Add headless CMS (Strapi for self-hosted, Sanity for managed) alongside Spring Boot content APIs
- Content from CMS is **fetched server-side** in Server Components and rendered as HTML

### 9.2 Content Types

| Content Type | Examples | CMS Model | Rendering |
|-------------|----------|-----------|-----------|
| **Room types** | Deluxe, Suite, Family | Structured (name, description, gallery, amenities, capacity) | ISR, revalidate on webhook |
| **Experiences** | Wine tasting, Spa, Cooking class | Structured + rich text | ISR |
| **Products** | Gift basket, Local wine | Structured (name, price, images, variants) | ISR |
| **Pages** | About, History, Location | Rich text/block content | ISR |
| **SEO metadata** | Per-page meta titles, descriptions | Structured fields on each content type | SSR |
| **Media** | Room photos, gallery images, hero banners | Image asset management with CDN | CDN |

---

## 10. Scalability Considerations

| Concern | At Launch (Phase 1-2) | At Growth (Phase 3-4) | At Scale (Future) |
|---------|----------------------|----------------------|-------------------|
| **Read traffic** | SSR from Next.js → Spring Boot → PostgreSQL | Add Redis cache in front of Spring Boot availability queries | Elasticsearch for search + geo queries; CDN for static content |
| **Write contention** | Row-level locking in PostgreSQL | Add hold TTL + queue for booking writes | Shard bookings by property; Temporal/Kafka for saga orchestration |
| **Auth** | JWT with refresh tokens | Rate limiting on auth endpoints | Dedicated auth service |
| **Media** | Next.js Image optimization | Cloudinary/image CDN | Multi-region CDN |
| **Cart** | Cookie-based (anon) + DB (auth) | Add cart persistence layer cache | Cart service with Redis |
| **CMS** | Content in Spring Boot | External headless CMS | Multi-environment CMS with webhook-based ISR |
| **Build/Deploy** | Single Next.js app → Vercel | Preview deployments per PR | Monorepo with Turborepo, micro-frontends |

---

## 11. Build Order & Dependencies

### Dependency Graph

```
Phase 1: Route Groups & Layouts
  │
  ├──► Phase 2a: Auth (login/register/session management)
  │       │
  │       ├──► Phase 2b: API Service Layer (typed clients for Spring Boot)
  │       │       │
  │       │       ├──► Phase 3a: E-commerce (product catalog + cart)
  │       │       │       │
  │       │       │       └──► Phase 4a: Full checkout (payment integration)
  │       │       │
  │       │       ├──► Phase 3b: Booking (availability + booking flow)
  │       │       │       │
  │       │       │       └──► Phase 4b: Payment + booking confirmation
  │       │       │
  │       │       └──► Phase 3c: Dashboard (my bookings, orders, profile)
  │       │
  │       └──► Phase 5: CMS Integration (headless CMS for content management)
  │
  └──► Phase 6: Advanced (personalization, multi-language, reviews)
```

### Detailed Phase Breakdown

| Phase | Components | Dependencies | Delivers |
|-------|-----------|-------------|----------|
| **1. Scaffold** | Route groups, layouts, placeholder pages, theme, Tailwind config | None | Structural foundation |
| **2a. Auth** | Login/register pages, middleware, cookie management, session refresh | Phase 1 | User can sign in/out |
| **2b. API Layer** | Service classes for each domain, typed responses, error handling, environment config | Phase 2a | Frontend can call Spring Boot |
| **3a. E-commerce** | Product catalog pages, cart (cookie + DB), add to cart, server actions | Phase 2b | Guest can browse + add to cart |
| **3b. Booking** | Availability calendar, booking form, hold/confirm flow, date picker | Phase 2b | Guest can book a room |
| **3c. Dashboard** | Booking history, order history, profile page, favorites | Phase 2a + 3a + 3b | Customer self-service |
| **4a. Checkout** | Cart → checkout flow, Stripe payment form, order confirmation | Phase 3a | Guest can purchase products |
| **4b. Payment** | Payment on booking, pre-auth flow, booking confirmation | Phase 3b | Guest can pay for bookings |
| **5. CMS** | Headless CMS integration, content components, webhook-based ISR | Phase 1 | Content editors update site |
| **6. Advanced** | i18n, personalization, reviews, analytics, A/B testing | Everything above | Production maturity |

### Phase Ordering Rationale

1. **Route groups first** — They define the entire architecture. Everything hangs off them. Do this before any feature code.
2. **Auth before API layer** — You need authentication working before you can securely call Spring Boot. Auth is also a prerequisite for meaningful dashboard work.
3. **API service layer before features** — Domain-specific service abstractions prevent inline fetch spaghetti. Build the generic client pattern first, then domain services.
4. **E-commerce and booking in parallel** — They share the API layer and auth but have independent UIs. Can be built by different developers.
5. **Dashboard after booking + e-commerce** — Dashboard surfaces data from both; it's the consumer of those features.
6. **CMS last** — Content can initially live in Spring Boot. CMS integration is additive and non-blocking.

---

## 12. References & Sources

### High Confidence (Verified with Official Sources + Production Examples)

| Source | Type | Used For |
|--------|------|----------|
| [AWS Sample Hospitality Architecture](https://github.com/aws-samples/sample-hospitality-systems) | Production reference | Component boundaries, event bus, booking engine vs PMS distinction |
| [Hotel Reservation System Design (HLD Handbook)](https://hld.handbook.academy/curriculum/case-studies/hotel-reservation/) | Technical deep-dive | Read/write path separation, exclusion constraints, Redis holds, Saga pattern |
| [Airbnb Architecture: Double-Booking Prevention](https://mdsanwarhossain.me/blog-hotel-booking-system-design.html) | Production architecture | Inventory service, optimistic locking, payment escrow, saga orchestration |
| [How Hotel Booking Engines Work (Acquaint Softtech)](https://acquaintsoft.com/blog/how-hotel-booking-engines-work) | Technical guide | Booking state machine, hold TTL, push/pull channel sync |
| [SmartServe AI Booking Platform (GitHub)](https://github.com/iprasuk/smartserve-ai-booking-platform) | Production code | Spring Boot + Next.js JWT architecture, controller/service/repository layering |
| [COOARD Salon Booking (Case Study)](https://mrhaseeb.com/case-studies/cooard-salon-platform) | Production case study | Route groups by context, middleware gating, multi-tenant patterns |
| [Next.js 16 + Clerk Booking Starter](https://codexmachina.dev/nextjs-postgres-clerk-booking) | Code reference | Booking schema (resources, slots, reservations), Edge proxy pattern |
| [Next.js E-commerce Patterns](https://www.lazarkapsarov.com/notes/nextjs-ecommerce-patterns) | Technical guide | Cookie-based cart, server components, encrypted cookies |
| [Next.js Project Structure Best Practices](https://eastondev.com/blog/en/posts/dev/20251218-nextjs-routing-best-practices/) | Next.js guide | Route groups, nested layouts, parallel routes for large projects |
| [Spring Boot + Next.js JWT Auth Setup (Boilerships)](https://boilerships.com/blog/nextjs-spring-boot-jwt-auth-cors-api-proxy) | Technical guide | BFF proxy pattern, HttpOnly cookies, CORS elimination |
| [Multi-Property Hotel Next.js Architecture](https://socialanimal.dev/blog/hotel-group-website-multi-property-nextjs-architecture/) | Architecture guide | CMS integration, theme tokens, property resolution, component composition |
| [Direct Booking Architecture (Social Animal)](https://socialanimal.dev/blog/hotel-direct-booking-website-architecture-reduce-ota-commissions/) | Architecture guide | Headless booking engine integration, performance targets, SEO structured data |
| [Next.js E-commerce Guide (ElevaSEO)](https://www.elevaseo.com/en/blog/headless/nextjs-ecommerce-guide) | Technical guide | Server actions, cart patterns, headless commerce architecture |
| [Headless WooCommerce + Next.js 16 (Cuibit)](https://cuibit.com/insights/headless-woocommerce-nextjs-16-store-api-guide-2026) | Integration guide | Checkout strategies, phased migration, API boundaries |
| [Next.js Ecommerce Architecture (Naturaily)](https://medium.com/@naturailycom/next-js-for-ecommerce-architecture-seo-and-real-builds-5e6bf57eaeee) | Architecture guide | Hybrid rendering for commerce, CMS + commerce backend split |
| [Yacht Charter Booking (DEV)](https://dev.to/designtocodes/building-a-yacht-charter-site-with-nextjs-app-router-the-parts-nobody-tells-you-22kc) | Production code | Availability route pattern, server action booking, schema validation |

### Medium Confidence (Cross-Referenced Across Multiple Sources)

| Source | Type | Used For |
|--------|------|----------|
| [Travel Booking Engine Architecture (ZealConnect)](https://www.zealconnect.com/blogs/travel-booking-engine-architecture-how-the-five-layers-work-and-where-each-one-breaks/) | Technical analysis | API gateway patterns, payment 3DS, supplier reconciliation |
| [Travel Tech 2026: Headless Migration](https://blog.roibase.com.tr/en/travel/travel-tech-2026-headless-booking-funnel) | Industry analysis | Edge caching strategy, PMS API latency, personalization at edge |
| [Hotel Booking Platform (prashantsre GitHub)](https://github.com/prashantsre/hotel-booking) | Production code | Full-stack Spring Boot + Next.js project structure, API design |
| [RoomScheduler (paulorag GitHub)](https://github.com/paulorag/roomScheduler) | Production code | Spring Boot + Next.js architecture, double-booking prevention |
| [Decoupled Architecture at Scale (DEV)](https://dev.to/victorstackai/decoupled-architecture-at-scale-global-hospitality-networks-22le) | Architecture case study | ISR revalidation via webhook, content hub pattern |
| [Headless WooCommerce + Next.js 16 Guide (Cuibit)](https://cuibit.com/insights/headless-woocommerce-nextjs-16-store-api-guide-2026) | Integration guide | Checkout strategies, phased migration, API boundaries |

---

## Architectural Constraints Summary

1. **Server-first:** All components are Server Components by default. Client interactivity requires explicit `"use client"`.
2. **Next.js is BFF only:** The browser talks to Next.js; Next.js talks to Spring Boot. No direct browser-to-Spring-Boot calls.
3. **JWT in HttpOnly cookies only:** No `localStorage`, no `sessionStorage` for tokens.
4. **No global state store:** Server Components for data, Server Actions for mutations, minimal client state.
5. **Route groups for context separation:** `(vetrina)` = public, `(auth)` = auth flows, `(dashboard)` = private app.
6. **Booking is a state machine:** Implemented on Spring Boot, consumed via typed API contracts.
7. **Cookie cart for anonymous users:** Merged to DB cart on login.
8. **Spring Boot is the source of truth:** For inventory, bookings, cart, orders, pricing. Next.js caches but never owns transactional data.
