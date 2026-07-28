---
title: "Unified Auth Flow: AuthContext, Cookie Persistence, Route Protection, Navigation"
quick_id: "260710-a1b"
slug: "auth-flow-unified"
date: "2026-07-10"
---

# Quick Task: Unified Auth Flow

Connect `(vetrina)`, `(auth)`, and `dashboard` route groups into a cohesive user flow with session persistence, navigation UI, and route protection.

## Tasks

### Task 1: AuthContext + Cookie Persistence + Root Provider
- Rewrite `src/context/AuthContext.tsx` with `isAuthenticated`, `login()`, `logout()` context
- Install `js-cookie` + `@types/js-cookie`
- Rewrite `src/lib/api.ts` to use cookies instead of localStorage
- Wrap root `src/app/layout.tsx` with `<AuthProvider>`

### Task 2: Navigation + Login Integration
- Update `(vetrina)/_components/Header.tsx` — conditional Sign In / My Dashboard / Logout buttons
- Update `(auth)/login/page.tsx` — use `useAuth().login()` instead of direct API call
- Update `dashboard/_components/DashboardLayout.tsx` — remove local `<AuthProvider>` (now at root)

### Task 3: Dashboard Sidebar + Route Protection
- Update `dashboard/_components/SidebarNav.tsx` — "Back to Shop" link, context logout, redirect to `/`
- Create `src/proxy.ts` (Next.js 16 convention) — protect `/dashboard/*`, redirect authenticated users from `/login`
