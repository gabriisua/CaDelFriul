---
id: 260722-fix
slug: fix-room-image-url-format
description: Fix room image URL format to include roomId in path
status: complete
date: 2026-07-22
---

# Summary: Fix Room Image URL Format

## Problem
The backend was generating image URLs as `/api/rooms/images/{filename}` which omitted the `roomId`. This caused 404 errors in the Angular frontend because the GET endpoint couldn't locate the physical files stored at `uploads/rooms/{roomId}/{filename}`.

## Solution
Updated the URL generation and serving logic to include `{roomId}` in the path:

1. **Fixed URL Generation** (`FileStorageService.storeFile()`)
   - Changed return format from `/api/{domain}/images/{uniqueFilename}` to `/api/{domain}/{entityId}/images/{uniqueFilename}`

2. **Fixed Image Serving** (`PublicRoomController.getImage()`)
   - Changed endpoint from `GET /api/rooms/images/{filename}` to `GET /api/rooms/{roomId}/images/{filename}`
   - Removed the `extractRoomIdFromFilename()` method since roomId is now in the path

3. **Fixed Image Deletion** (`RoomService.deleteImage()`)
   - Updated URL parsing comment to reflect new format

4. **Updated Product Image Serving** (`PublicProductController.getImage()`)
   - Changed endpoint from `GET /api/products/images/{filename}` to `GET /api/products/{productId}/images/{filename}`
   - Removed the `extractProductIdFromFilename()` method for consistency

## Files Modified
- `src/main/java/com/cadelfriul/backend/core/service/FileStorageService.java`
- `src/main/java/com/cadelfriul/backend/hospitality/controller/PublicRoomController.java`
- `src/main/java/com/cadelfriul/backend/hospitality/service/RoomService.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/controller/PublicProductController.java`

## API Changes
**Before:**
```
POST /api/admin/rooms/{id}/images → returns /api/rooms/images/{filename}
GET /api/rooms/images/{filename}
```

**After:**
```
POST /api/admin/rooms/{id}/images → returns /api/rooms/{id}/images/{filename}
GET /api/rooms/{roomId}/images/{filename}
```

## Verification
- Code compiles successfully with `./gradlew compileJava`
- URL format now matches physical storage structure
- Frontend can now load images via `<img src="/api/rooms/{roomId}/images/{filename}">`

## Notes
- Existing images in the database with old URL format will need migration
- The new URL pattern is consistent with REST conventions (resource under its parent)
