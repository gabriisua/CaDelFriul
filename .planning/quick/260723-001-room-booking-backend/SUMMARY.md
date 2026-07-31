---
quick_id: 260723-001
slug: room-booking-backend
status: complete
description: Room Booking backend (entity, repository, DTOs, service, controllers)
date: 2026-07-23
---

## Summary

Implemented the backend portion of a Room Booking system in the hospitality module.

### Files Created
1. `BookingStatus.java` — Enum with PENDING, CONFIRMED, CANCELLED values
2. `RoomBooking.java` — JPA entity with UUID id, roomId, userEmail, checkInDate, checkOutDate, totalPrice, status, timestamps
3. `RoomBookingRepository.java` — JPA repository with JPQL overlap detection query
4. `RoomBookingRequest.java` — DTO with validation annotations
5. `RoomBookingResponse.java` — DTO mapping entity to response
6. `RoomBookingService.java` — Business logic for create, getAll, updateStatus
7. `PublicBookingController.java` — POST endpoint at /api/bookings
8. `AdminBookingController.java` — GET and PATCH endpoints at /api/admin/bookings

### Files Modified
1. `SecurityConfig.java` — Added permitAll for /api/bookings/**

### Key Decisions
- RoomBooking placed in `hospitality` module alongside Room entity
- Overlap detection uses JPQL query filtering CANCELLED bookings
- Total price calculated as pricePerNight * number of nights
- Admin endpoints protected with `@PreAuthorize("hasRole('SUPER_ADMIN')")`
- Public booking endpoint returns 201 Created

### Verification
- Compilation successful (BUILD SUCCESSFUL)
- All files follow existing project conventions
