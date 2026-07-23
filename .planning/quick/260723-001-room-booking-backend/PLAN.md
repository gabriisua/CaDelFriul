---
quick_id: 260723-001
slug: room-booking-backend
description: Room Booking backend (entity, repository, DTOs, service, controllers)
created: 2026-07-23
must_haves:
  truths:
    - BookingStatus enum with PENDING, CONFIRMED, CANCELLED values
    - RoomBooking entity with UUID id, roomId, userEmail, dates, totalPrice, status, timestamps
    - RoomBookingRepository with JPQL overlap query ignoring CANCELLED bookings
    - RoomBookingRequest DTO with validation annotations
    - RoomBookingResponse DTO with all entity fields
    - RoomBookingService with create, getAll, updateStatus methods
    - PublicBookingController at /api/bookings with POST endpoint
    - AdminBookingController at /api/admin/bookings with GET and PATCH endpoints
    - Overlap detection returns 409 Conflict
    - Total price calculated from Room.pricePerNight * nights
  artifacts:
    - BookingStatus.java
    - RoomBooking.java
    - RoomBookingRepository.java
    - RoomBookingRequest.java
    - RoomBookingResponse.java
    - RoomBookingService.java
    - PublicBookingController.java
    - AdminBookingController.java
  key_links:
    - be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/entity/Room.java
    - be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/repository/RoomRepository.java
    - be-cadelfriul/src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java
---

# Room Booking Backend

## Context
Implement the backend portion of a Room Booking system in the hospitality module of the Spring Boot backend.

## Task 1: Entity, Enum, Repository, DTOs
Create the data layer for room bookings.

### Files
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/entity/BookingStatus.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/entity/RoomBooking.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/repository/RoomBookingRepository.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/dto/RoomBookingRequest.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/dto/RoomBookingResponse.java`

### Action
1. Create `BookingStatus` enum with `PENDING`, `CONFIRMED`, `CANCELLED`
2. Create `RoomBooking` entity with all specified fields, following existing entity patterns (UUID generation, JPA annotations)
3. Create `RoomBookingRepository` extending `JpaRepository<RoomBooking, UUID>` with a JPQL query for overlap detection
4. Create `RoomBookingRequest` DTO with `@NotNull` and `@FutureOrPresent` validation
5. Create `RoomBookingResponse` DTO mapping entity to response

### Verify
- Files compile without errors
- JPQL query correctly filters: `existing.checkInDate < reqCheckOut AND existing.checkOutDate > reqCheckIn AND existing.status != CANCELLED`

### Done
- [ ] All 5 files created with correct package structure

## Task 2: Service Layer
Implement booking business logic.

### Files
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/service/RoomBookingService.java`

### Action
1. Inject `RoomBookingRepository` and `RoomRepository`
2. `createBooking`: validate checkOut > checkIn, check overlap (409 if exists), fetch Room for price calc, set PENDING
3. `getAllBookings`: return all bookings
4. `updateBookingStatus`: find by ID, update status

### Verify
- Service compiles
- Overlap check uses repository query
- Total price = `room.getPricePerNight().multiply(BigDecimal.valueOf(nights))`

### Done
- [ ] Service created with all 3 methods

## Task 3: Controllers
Create public and admin REST endpoints.

### Files
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/controller/PublicBookingController.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/controller/AdminBookingController.java`

### Action
1. `PublicBookingController`: `@RequestMapping("/api/bookings")`, POST endpoint accepting `@Valid @RequestBody RoomBookingRequest`
2. `AdminBookingController`: `@RequestMapping("/api/admin/bookings")`, `@PreAuthorize("hasRole('SUPER_ADMIN')")`, GET all, PATCH `/{id}/status` accepting `BookingStatus` body
3. Update `SecurityConfig` to permit `/api/bookings/**` as public

### Verify
- Controllers compile
- Public endpoint returns 201 on success
- Admin endpoint returns 200 on success
- Security config permits public booking endpoint

### Done
- [ ] Both controllers created
- [ ] SecurityConfig updated
