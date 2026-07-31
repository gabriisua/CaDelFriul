# Quick Task 260727-fm3 Summary: Fix React Hydration Error in Header and Enforce Cart Authentication

**Created:** 2026-07-27
**Status:** Complete

## One-liner

Fixed Header cart badge hydration mismatch via `isMounted` pattern, added auth protection to cart route, and ensured cart state clears on logout.

## Changes Made

### Task 1: Fix Hydration Error in Header

**File:** `src/app/(vetrina)/_components/Header.tsx`

Added `isMounted` state with `useEffect` to gate cart badge rendering. Server and client now both render no badge initially, eliminating the hydration mismatch.

- Added `useEffect` import
- Added `isMounted` state + `useEffect` to set it on mount
- Wrapped cart badge `{itemCount > 0 && ...}` with `{isMounted && itemCount > 0 && ...}`

### Task 2: Protect Cart Route & Clear State

**File:** `src/app/(vetrina)/cart/page.tsx`

Added authentication guard to cart page. Unauthenticated users are redirected to `/login` and cart localStorage is cleared. Shows loading skeleton while auth state resolves.

- Added `useEffect`, `useState`, `useRouter` imports
- Added `useAuth` import
- Added `isMounted` state + `useEffect` for mount tracking
- Added redirect `useEffect` that clears cart and redirects when unauthenticated
- Added loading skeleton return for `!isMounted || loading`
- Added "Please sign in" fallback for `!isAuthenticated`

### Task 3: Clear Cart on Logout

**File:** `src/context/AuthContext.tsx`

Added `localStorage.removeItem("cadelfriul_cart")` to the `logout` function to clear cart state when user logs out.

### Rule 1 Fix: Missing "use client" in ProductCard

**File:** `src/app/(vetrina)/_components/ProductCard.tsx`

Pre-existing bug: `ProductCard.tsx` was importing `useState` without `"use client"` directive, causing build failure. Added the directive.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| All tasks + Rule 1 fix | `1a0b21a` | `fix(260727-fm3): fix Header hydration error and enforce cart auth` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing "use client" in ProductCard.tsx**
- **Found during:** Build verification
- **Issue:** `ProductCard.tsx` imported `useState` without `"use client"` directive, causing Turbopack build failure
- **Fix:** Added `"use client"` directive at top of file
- **Files modified:** `src/app/(vetrina)/_components/ProductCard.tsx`
- **Commit:** `1a0b21a`

## Known Stubs

None — all changes are functional with no placeholder data.

## Threat Flags

None — no new security-relevant surface introduced. Auth redirect and cart clearing are defensive patterns that reduce attack surface.

## Self-Check: PASSED

All files exist, commit `1a0b21a` verified.
