---
quick_id: "260710-a1b"
slug: "auth-flow-unified"
status: "complete"
date: "2026-07-10"
---

# Summary: Unified Auth Flow

## What was done

### 1. AuthContext + Cookie Persistence
- Installed `js-cookie` and `@types/js-cookie`
- Rewrote `src/lib/api.ts`: `getToken()`, `setToken()`, `removeToken()` use `js-cookie` with `accessToken` cookie name, `path: "/"`, `sameSite: "lax"`
- Removed all `localStorage` references from API layer
- Rewrote `src/context/AuthContext.tsx`: exposes `user`, `isAuthenticated`, `loading`, `login(email, password)`, `logout()`
- AuthContext checks cookie on mount, fetches `/api/auth/me` if token exists, sets loading state correctly
- Login function calls API, stores cookie, then fetches profile to populate user state

### 2. Root Layout Provider
- Updated `src/app/layout.tsx` — wraps `{children}` with `<AuthProvider>` so auth context is available globally

### 3. Navigation UI (Header)
- Updated `(vetrina)/_components/Header.tsx`:
  - Authenticated: shows "My Dashboard" button (with User icon) + Logout icon button
  - Unauthenticated: shows "Sign In" button
  - Mobile: shows "My Dashboard" link + "Logout" button, or "Sign In" link
  - Logout calls `useAuth().logout()` then redirects to `/`

### 4. Login Flow Integration
- Updated `(auth)/login/page.tsx`: imports `useAuth` instead of `login` from `@/lib/api`
- Form calls `useAuth().login(email, password)` which stores cookie + fetches profile
- On success, redirects to `/dashboard` via `router.push`

### 5. Dashboard Layout
- Updated `dashboard/_components/DashboardLayout.tsx`: removed local `<AuthProvider>` wrapper (now at root)
- Updated `dashboard/_components/SidebarNav.tsx`:
  - "Back to Shop" link (Home icon) navigates to `/`
  - Logout button uses `useAuth().logout()` and redirects to `/` (not `/login`)
  - Uses `useAuth()` for user data (already was using it)

### 6. Route Protection (Proxy)
- Created `src/proxy.ts` (Next.js 16 convention — replaces deprecated `middleware.ts`)
- `/dashboard/*` without `accessToken` cookie → redirect to `/login?from=<path>`
- `/login` or `/register` with `accessToken` cookie → redirect to `/dashboard`
- Matcher: `["/dashboard/:path*", "/login", "/register"]`
