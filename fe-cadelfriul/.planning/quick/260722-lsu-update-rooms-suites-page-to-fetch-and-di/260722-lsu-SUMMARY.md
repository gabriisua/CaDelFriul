# Quick Task 260722-lsu — Summary

**Status:** Completed
**Date:** 2026-07-22

## What changed

Replaced hardcoded mock room data on the Rooms & Suites page with live data fetched from `GET /api/rooms`.

### Changed files
- `src/lib/api.ts` — Added `Room` interface, `getRoomImageUrl()`, and `fetchRooms()`
- `src/app/(vetrina)/_components/RoomCard.tsx` — Accepts `room: Room` prop, renders image banner with fallback, formats price as `€XX.XX / night`, dynamically generates amenity badges, added hover shadow
- `src/app/(vetrina)/rooms/page.tsx` — Converted to client component, fetches rooms from API, added loading skeleton / error / empty states
- `next.config.ts` — Broadened image remote pattern to `/api/**`

## Verification
- `npx tsc --noEmit` — pass
- `npm run lint` — no new errors
