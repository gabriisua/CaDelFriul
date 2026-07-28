# Summary: Fix SidebarNav hydration mismatch

## What was done
- Added `isMounted` state (`useState(false)`) and `useEffect` to set it on client
- Server-rendered Skeleton now matches first client render, preventing hydration mismatch
- Only shows actual user avatar/name after mount

## Files changed
- `src/app/dashboard/_components/SidebarNav.tsx` — added `isMounted` + conditional render

## Verification
- `npm run build`: all 20 routes compile successfully
