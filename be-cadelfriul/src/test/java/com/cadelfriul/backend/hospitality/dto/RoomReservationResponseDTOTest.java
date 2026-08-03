package com.cadelfriul.backend.hospitality.dto;

import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.Room;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RoomReservationResponseDTOTest {

    @Test
    void roomReservationResponse_shouldMapAllFieldsFromReservation() {
        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setName("Camera Panoramica");
        room.setPricePerNight(new BigDecimal("120.00"));
        room.setCapacity(2);
        setField(room, "id", roomId);

        UUID reservationId = UUID.randomUUID();
        LocalDate checkInDate = LocalDate.of(2026, 8, 10);
        LocalDate checkOutDate = LocalDate.of(2026, 8, 13);
        LocalDateTime createdAt = LocalDateTime.of(2026, 8, 1, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2026, 8, 1, 10, 5);

        RoomReservation reservation = new RoomReservation();
        reservation.setRoom(room);
        reservation.setUserId("guest@example.com");
        reservation.setCheckInDate(checkInDate);
        reservation.setCheckOutDate(checkOutDate);
        reservation.setTotalPrice(new BigDecimal("360.00"));
        reservation.setStatus(ReservationStatus.CONFIRMED);
        setField(reservation, "id", reservationId);
        setField(reservation, "createdAt", createdAt);
        setField(reservation, "updatedAt", updatedAt);

        RoomReservationResponseDTO response = new RoomReservationResponseDTO(reservation);

        assertEquals(reservationId, response.getId());
        assertEquals(roomId, response.getRoom().getId());
        assertEquals("guest@example.com", response.getUserId());
        assertEquals(checkInDate, response.getCheckInDate());
        assertEquals(checkOutDate, response.getCheckOutDate());
        assertEquals(new BigDecimal("360.00"), response.getTotalPrice());
        assertEquals(ReservationStatus.CONFIRMED, response.getStatus());
        assertEquals(createdAt, response.getCreatedAt());
        assertEquals(updatedAt, response.getUpdatedAt());
    }

    @Test
    void roomReservationResponse_shouldContainNestedRoomSummary() {
        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setName("Camera Panoramica");
        room.setPricePerNight(new BigDecimal("120.00"));
        room.setCapacity(2);
        setField(room, "id", roomId);

        RoomReservation reservation = new RoomReservation();
        reservation.setRoom(room);
        reservation.setUserId("guest@example.com");
        reservation.setCheckInDate(LocalDate.of(2026, 8, 10));
        reservation.setCheckOutDate(LocalDate.of(2026, 8, 13));
        reservation.setTotalPrice(new BigDecimal("360.00"));
        reservation.setStatus(ReservationStatus.CONFIRMED);

        RoomReservationResponseDTO response = new RoomReservationResponseDTO(reservation);

        assertInstanceOf(RoomResponse.class, response.getRoom());
        assertEquals(roomId, response.getRoom().getId());
        assertEquals("Camera Panoramica", response.getRoom().getName());
        assertEquals(new BigDecimal("120.00"), response.getRoom().getPricePerNight());
        assertEquals(2, response.getRoom().getCapacity());
    }

    @Test
    void roomEntity_shouldUseLazyManyToOneForRoom() {
        try {
            var field = findField(RoomReservation.class, "room");
            var annotation = field.getAnnotation(jakarta.persistence.ManyToOne.class);
            assertNotNull(annotation, "@ManyToOne annotation should exist on room field");
            assertEquals(jakarta.persistence.FetchType.LAZY, annotation.fetch(),
                    "room should use FetchType.LAZY");
        } catch (NoSuchFieldException e) {
            fail("RoomReservation entity should have a 'room' field");
        }
    }

    @Test
    void stripeCheckoutUrl_defaultsToNull() {
        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setName("Camera Panoramica");
        room.setPricePerNight(new BigDecimal("120.00"));
        room.setCapacity(2);
        setField(room, "id", roomId);

        RoomReservation reservation = new RoomReservation();
        reservation.setRoom(room);
        reservation.setUserId("guest@example.com");
        reservation.setCheckInDate(LocalDate.of(2026, 8, 10));
        reservation.setCheckOutDate(LocalDate.of(2026, 8, 13));
        reservation.setTotalPrice(new BigDecimal("360.00"));
        reservation.setStatus(ReservationStatus.PENDING);

        RoomReservationResponseDTO response = new RoomReservationResponseDTO(reservation);

        assertNull(response.getStripeCheckoutUrl());
    }

    @Test
    void stripeCheckoutUrl_setGetRoundTrip() {
        UUID roomId = UUID.randomUUID();
        Room room = new Room();
        room.setName("Camera Panoramica");
        room.setPricePerNight(new BigDecimal("120.00"));
        room.setCapacity(2);
        setField(room, "id", roomId);

        RoomReservation reservation = new RoomReservation();
        reservation.setRoom(room);
        reservation.setUserId("guest@example.com");
        reservation.setCheckInDate(LocalDate.of(2026, 8, 10));
        reservation.setCheckOutDate(LocalDate.of(2026, 8, 13));
        reservation.setTotalPrice(new BigDecimal("360.00"));
        reservation.setStatus(ReservationStatus.PENDING);

        RoomReservationResponseDTO response = new RoomReservationResponseDTO(reservation);

        response.setStripeCheckoutUrl("https://checkout.stripe.com/c/pay/test_123");

        assertEquals("https://checkout.stripe.com/c/pay/test_123", response.getStripeCheckoutUrl());
    }

    // --- helpers ---

    private void setField(Object target, String fieldName, Object value) {
        try {
            var field = findField(target.getClass(), fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field '" + fieldName + "' on " + target.getClass().getSimpleName(), e);
        }
    }

    private java.lang.reflect.Field findField(Class<?> clazz, String fieldName) throws NoSuchFieldException {
        Class<?> current = clazz;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }
}
