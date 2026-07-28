# Quick Task 260710-e2f: Fix SidebarNav hydration mismatch

## Objective
Fix hydration mismatch in `SidebarNav.tsx` where server renders Skeleton but client immediately renders user avatar.

## Root Cause
`useAuth()` returns `loading: true` on server but `loading: false` + populated `user` on client (from cookie), causing different DOM on first render.

## Changes
- `src/app/dashboard/_components/SidebarNav.tsx`: Added `isMounted` state + `useEffect`, renders Skeleton until mounted to match server HTML

## Verification
- `npm run build` passes
