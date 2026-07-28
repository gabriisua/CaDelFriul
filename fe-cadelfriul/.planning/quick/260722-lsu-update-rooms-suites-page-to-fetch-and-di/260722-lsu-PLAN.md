# Quick Task 260722-lsu: Update Rooms & Suites Page

## Objective
Replace hardcoded mock room data with live API data from the Spring Boot backend.

## Tasks

### 1. Add Room interface and fetchRooms to API client
- Add `Room` interface to `src/lib/api.ts` with fields: `id`, `name`, `description`, `pricePerNight`, `amenities[]`, `imageUrls[]`
- Add `getRoomImageUrl()` helper to prefix relative URLs with `API_BASE_URL`
- Add `fetchRooms()` function calling `GET /api/rooms`

### 2. Update next.config.ts image remote patterns
- Broaden `pathname` from `/api/products/images/**` to `/api/**` to allow room images from the backend

### 3. Refactor RoomCard component
- Accept `room: Room` prop instead of individual fields
- Add image banner using `room.imageUrls[0]` with `next/image`, fallback via `onError`
- Format price as `€XX.XX / night` from `room.pricePerNight`
- Bind `room.name` and `room.description` directly
- Dynamically render amenity badges from `room.amenities`
- Add hover shadow transition for premium feel

### 4. Convert rooms page to client component
- Add `"use client"` directive
- Fetch rooms via `fetchRooms()` in `useEffect`
- Add loading skeleton, error state, and empty state
- Map `Room[]` to `<RoomCard>` using `room.id` as key

## Verification
- `npx tsc --noEmit` — no type errors
- `npm run lint` — no new lint errors
- `npm run build` — builds successfully
