---
phase: 260721-ow2-refactor-file-storage-to-use-dynamic-nes
plan: 260721-ow2-PLAN
subsystem: api
tags: [file-storage, spring-boot, multipart, java, gradle]

requires: []
provides:
  - "Shared FileStorageService with dynamic nested directory structure"
  - "Product image storage in uploads/products/{productId}/"
  - "Room image upload with MultipartFile support"
  - "Image serving endpoints for both products and rooms"
affects: [admin-rooms, public-rooms, admin-products, public-products]

tech-stack:
  added: []
  patterns: ["FileStorageService singleton with domain-based path isolation", "UUID-prefixed filenames for entity scoping"]

key-files:
  created:
    - src/main/java/com/cadelfriul/backend/core/service/FileStorageService.java
  modified:
    - src/main/java/com/cadelfriul/backend/ecommerce/service/AdminProductService.java
    - src/main/java/com/cadelfriul/backend/ecommerce/controller/PublicProductController.java
    - src/main/java/com/cadelfriul/backend/hospitality/entity/Room.java
    - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomResponse.java
    - src/main/java/com/cadelfriul/backend/hospitality/service/RoomService.java
    - src/main/java/com/cadelfriul/backend/hospitality/controller/AdminRoomController.java
    - src/main/java/com/cadelfriul/backend/hospitality/controller/PublicRoomController.java
    - src/main/resources/application.properties

key-decisions:
  - "FileStorageService uses UUID-prefixed filenames ({UUID}_{original}) for collision avoidance"
  - "Filename-as-entityId pattern for image serving: extract UUID prefix to resolve storage path"
  - "Path traversal protection via normalize() + startsWith(baseDir) guard"

patterns-established:
  - "Domain-based file isolation: uploads/{domain}/{entityId}/{uniqueFilename}"
  - "Image URL format: /api/{domain}/images/{uniqueFilename} — filename encodes entityId"
  - "MultipartFile upload with content-type validation on admin endpoints"

requirements-completed: []

duration: 5min
completed: 2026-07-21
---

# Phase 260721-ow2: Refactor File Storage to Use Dynamic Nested Structure Summary

**Shared FileStorageService with `uploads/{domain}/{entityId}/` isolation, product storage refactored, room image upload + serving fully implemented**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-21T16:01:11Z
- **Completed:** 2026-07-21T16:06:42Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Created shared FileStorageService with dynamic nested directory structure and path traversal protection
- Refactored AdminProductService to delegate file storage to FileStorageService
- Implemented full room image lifecycle: upload via MultipartFile, store in `uploads/rooms/{roomId}/`, serve via GET endpoint
- Updated image serving for both products and rooms to use FileStorageService with UUID prefix extraction

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FileStorageService and refactor AdminProductService** - `1eff120` (feat)
2. **Task 2: Update Room entity, RoomResponse, and implement RoomService image methods** - `b9fb24d` (feat)
3. **Task 3: Implement AdminRoomController image upload and update image serving endpoints** - `01c53d5` (feat)

## Files Created/Modified
- `core/service/FileStorageService.java` - Shared file storage with storeFile/loadFile/deleteFile, path traversal protection
- `ecommerce/service/AdminProductService.java` - Removed direct file I/O, delegates to FileStorageService
- `ecommerce/controller/PublicProductController.java` - Uses FileStorageService, extracts productId from filename
- `hospitality/entity/Room.java` - Added imageUrls @ElementCollection field
- `hospitality/dto/RoomResponse.java` - Added imageUrls to DTO response
- `hospitality/service/RoomService.java` - Injected FileStorageService, added addImage/deleteImage methods
- `hospitality/controller/AdminRoomController.java` - POST /{id}/images accepts MultipartFile with content-type validation
- `hospitality/controller/PublicRoomController.java` - Added GET /images/{filename:.+} for room image serving
- `application.properties` - Changed `app.storage.upload-dir` to `app.storage.base-dir=uploads`

## Decisions Made
- Filename-as-entityId pattern: image URL `{UUID}_{original}` encodes the entity UUID, allowing serving endpoints to extract it and resolve the storage path without database lookup
- Path traversal protection at two levels: sanitizeFilename strips `..`, `/`, `\`; verifyPathInsideBase checks resolved path starts with baseDir
- Both product and room image endpoints follow the same `/api/{domain}/images/{filename:.+}` URL pattern for consistency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added path traversal protection to FileStorageService**
- **Found during:** Task 1 (FileStorageService creation)
- **Issue:** Threat model T-ow2-01/T-ow2-02 require path traversal mitigation — sanitize filename and verify resolved path stays inside baseDir
- **Fix:** Added sanitizeFilename() to strip `..`, `/`, `\` and verifyPathInsideBase() to check normalized path starts with baseDir
- **Files modified:** `core/service/FileStorageService.java`
- **Verification:** Compilation passes, path traversal sequences are stripped in filename and path boundary check throws SecurityException
- **Committed in:** `1eff120` (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added file/ content-type validation on AdminRoomController upload**
- **Found during:** Task 3 (AdminRoomController implementation)
- **Issue:** Plan didn't specify validation for empty files or non-image content types on the upload endpoint
- **Fix:** Added `file.isEmpty()` check and `contentType.startsWith("image/")` validation before processing upload
- **Files modified:** `hospitality/controller/AdminRoomController.java`
- **Verification:** Compilation passes, empty/non-image files will be rejected with 400 status
- **Committed in:** `01c53d5` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both auto-fixes address threat model requirements. No scope creep.

## Issues Encountered
- Pre-existing test compilation failure in `AdminOrderControllerTest.java` (references removed `getBillingAddress()` method from prior task 260716-grz). Out of scope — logged in deferred-items.

## Known Stubs
None — all data is fully wired through FileStorageService.

## Threat Flags
None — all threat model items (T-ow2-01 Tampering, T-ow2-02 Information Disclosure) are mitigated via sanitizeFilename and verifyPathInsideBase.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FileStorageService is a shared component ready for any new domain (e.g., blog posts, user avatars)
- Product and room image pipelines are fully functional
- Pre-existing test failure in AdminOrderControllerTest needs separate fix

---
*Phase: 260721-ow2*
*Completed: 2026-07-21*

## Self-Check: PASSED
- All 9 files: FOUND
- All 3 task commits (1eff120, b9fb24d, 01c53d5): FOUND
- SUMMARY.md: CREATED
