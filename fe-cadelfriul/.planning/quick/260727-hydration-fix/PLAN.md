# Quick Task 260727: Fix React Hydration Errors in Cart and Auth Components

**Created:** 2026-07-27
**Status:** Ready for execution

## Task Description

Fix React Hydration errors in Next.js Cart and Auth components. The errors occur because server-rendered HTML does not match client-rendered HTML due to reliance on client-side state (`localStorage`, cookies) during initial render.

## Root Causes Identified

### 1. CartContext.tsx (HIGH SEVERITY)
- `useState(() => loadCart())` reads `localStorage` during server render (returns `[]`)
- On client, if items exist in `localStorage`, returns actual data
- **Result:** Server renders empty cart, client renders populated cart → hydration mismatch

### 2. AuthContext.tsx (HIGH SEVERITY)
- `useState(() => !!getToken())` calls `Cookies.get()` via `js-cookie`
- On server, `document.cookie` doesn't exist → returns `undefined` → `false`
- On client, cookie exists → returns `true`
- **Result:** Server renders "Sign In", client renders "My Dashboard" → hydration mismatch

### 3. sonner.tsx (HIGH SEVERITY)
- `useTheme()` from `next-themes` is called without a wrapping `ThemeProvider`
- `next-themes` may inject a theme-detection script that modifies `<html>` class
- **Result:** DOM mutation before React hydrates → hydration mismatch on every page

### 4. Header.tsx (CASCADING RISK)
- Consumes both `useAuth()` and `useCart()`
- Conditionally renders auth-dependent UI (Sign In vs My Dashboard)
- Conditionally renders cart badge (0 vs N items)
- **Result:** Every public page shows different Header content after hydration

## Implementation Plan

### Task 1: Fix CartContext Hydration Mismatch

**File:** `src/context/CartContext.tsx`

**Changes:**
1. Add `isMounted` state variable (boolean, default `false`)
2. Add `useEffect` to set `isMounted = true` on client mount
3. Modify `useState` initializer to always return `[]` on server
4. In `useEffect`, load cart from `localStorage` after mount
5. Return `items` state that starts empty and gets populated client-side
6. Guard `localStorage.setItem` with `isMounted` check

**Pattern:**
```tsx
const [items, setItems] = useState<CartItem[]>([]);
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
  // Load cart from localStorage after mount
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (stored) {
    try {
      setItems(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }
}, []);

useEffect(() => {
  if (isMounted) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
}, [items, isMounted]);
```

**Why this works:**
- Server renders: `items = []` (always)
- Client initial render: `items = []` (matches server)
- Client after mount: `items = [stored data...]` (triggers re-render, no mismatch)

---

### Task 2: Fix AuthContext Hydration Mismatch

**File:** `src/context/AuthContext.tsx`

**Changes:**
1. Add `isMounted` state variable (boolean, default `false`)
2. Add `useEffect` to set `isMounted = true` on client mount
3. Change `useState(() => !!getToken())` to `useState(false)` (always start as not authenticated)
4. In `useEffect`, check for token after mount and trigger profile fetch
5. Add `hydrated` state to track when auth state is resolved

**Pattern:**
```tsx
const [user, setUser] = useState<UserResponse | null>(null);
const [loading, setLoading] = useState(false);
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
  // Check for token after mount
  const token = getToken();
  if (token) {
    setLoading(true);
    fetchProfile()
      .then((profile) => {
        if (mounted.current) setUser(profile);
      })
      .catch(() => {
        if (mounted.current) setUser(null);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }
}, []);
```

**Why this works:**
- Server renders: `isAuthenticated = false` (always)
- Client initial render: `isAuthenticated = false` (matches server)
- Client after mount: `isAuthenticated = true/false` (triggers re-render, no mismatch)

---

### Task 3: Fix Toaster ThemeProvider Issue

**File:** `src/components/ui/sonner.tsx`

**Changes:**
1. Wrap `useTheme()` call in a try-catch or check if `ThemeProvider` exists
2. Alternatively, create a wrapper component that handles missing theme context
3. Fallback to "system" theme if no ThemeProvider

**Option A (Recommended): Create wrapper component**
```tsx
"use client"

import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  
  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setTheme(mediaQuery.matches ? "dark" : "light")
    
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light")
    }
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      {...props}
    />
  )
}

export { Toaster }
```

**Why this works:**
- Removes dependency on `next-themes` ThemeProvider
- Detects system theme directly via `matchMedia`
- No DOM mutations before React hydrates

---

### Task 4: Fix Header Hydration Mismatch

**File:** `src/app/(vetrina)/_components/Header.tsx`

**Changes:**
1. Add `isMounted` state variable
2. Add `useEffect` to set `isMounted = true`
3. While `!isMounted`, render neutral state (no auth buttons, no cart badge)
4. After mount, render actual auth/cart state

**Pattern:**
```tsx
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// In render:
{!isMounted ? (
  // Neutral state: just logo and nav
  <>
    <Link href="/">Ca' Del Friul</Link>
    {/* nav links */}
    <Link href="/cart">
      <ShoppingBag />
      {/* No badge */}
    </Link>
    <Link href="/login">Sign In</Link>
  </>
) : (
  // Actual state after hydration
  <>
    <Link href="/">Ca' Del Friul</Link>
    {/* nav links */}
    <Link href="/cart">
      <ShoppingBag />
      {itemCount > 0 && <span>{itemCount}</span>}
    </Link>
    {isAuthenticated ? (
      <>
        <Link href="/dashboard">My Dashboard</Link>
        <Button onClick={handleLogout}>Logout</Button>
      </>
    ) : (
      <Link href="/login">Sign In</Link>
    )}
  </>
)}
```

**Why this works:**
- Server renders: neutral state (Sign In, no badge)
- Client initial render: neutral state (matches server)
- Client after mount: actual state (triggers re-render, no mismatch)

---

### Task 5: Fix CartPage Hydration Mismatch

**File:** `src/app/(vetrina)/cart/page.tsx`

**Changes:**
1. Add `isMounted` state variable
2. Add `useEffect` to set `isMounted = true`
3. While `!isMounted`, show skeleton loader
4. After mount, show actual cart content

**Pattern:**
```tsx
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-4 w-32" />
      {/* Skeleton for cart items */}
    </div>
  );
}

// Actual cart content
```

---

### Task 6: Fix ShopPage Hydration Mismatch

**File:** `src/app/(vetrina)/shop/page.tsx`

**Changes:**
1. Add `isMounted` state variable
2. Add `useEffect` to set `isMounted = true`
3. While `!isMounted`, show skeleton loader (already exists)
4. Ensure auth-dependent button text is hydration-safe

**Note:** ShopPage already has loading state, but needs `isMounted` to handle auth state hydration.

---

## Files to Modify

1. `src/context/CartContext.tsx` - Add `isMounted` pattern
2. `src/context/AuthContext.tsx` - Add `isMounted` pattern
3. `src/components/ui/sonner.tsx` - Remove `next-themes` dependency, use direct `matchMedia`
4. `src/app/(vetrina)/_components/Header.tsx` - Add `isMounted` pattern
5. `src/app/(vetrina)/cart/page.tsx` - Add `isMounted` pattern
6. `src/app/(vetrina)/shop/page.tsx` - Add `isMounted` pattern

## Verification

After implementation:
1. Run `npm run build` to ensure no build errors
2. Run `npm run dev` and test in browser
3. Check browser console for hydration warnings
4. Test cart persistence across page refreshes
5. Test auth state persistence across page refreshes
6. Test Header displays correctly after hydration

## Success Criteria

- [ ] No React Hydration warnings in browser console
- [ ] Cart items persist across page refreshes
- [ ] Auth state persists across page refreshes
- [ ] Header shows correct state (Sign In vs My Dashboard) after mount
- [ ] Cart badge shows correct count after mount
- [ ] All pages render without hydration mismatches
