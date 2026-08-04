package com.cadelfriul.backend.hospitality.service;

import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoomReservationServiceTest {

    @Test
    void expandDates_inclusiveCheckInExclusiveCheckOut() {
        List<LocalDate> dates = RoomReservationService.expandBookedDates(
                List.of(reservation(LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 13))));

        assertEquals(List.of(
                LocalDate.of(2026, 8, 10),
                LocalDate.of(2026, 8, 11),
                LocalDate.of(2026, 8, 12)), dates);
    }

    @Test
    void expandDates_singleNightReservation() {
        List<LocalDate> dates = RoomReservationService.expandBookedDates(
                List.of(reservation(LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 11))));

        assertEquals(List.of(LocalDate.of(2026, 8, 10)), dates);
    }

    @Test
    void expandDates_deduplicatesOverlappingReservations() {
        List<LocalDate> dates = RoomReservationService.expandBookedDates(List.of(
                reservation(LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 13)),
                reservation(LocalDate.of(2026, 8, 12), LocalDate.of(2026, 8, 15))));

        assertEquals(List.of(
                LocalDate.of(2026, 8, 10),
                LocalDate.of(2026, 8, 11),
                LocalDate.of(2026, 8, 12),
                LocalDate.of(2026, 8, 13),
                LocalDate.of(2026, 8, 14)), dates);
        assertEquals(5, dates.size());
    }

    @Test
    void expandDates_sortsUnsortedInput() {
        List<LocalDate> dates = RoomReservationService.expandBookedDates(List.of(
                reservation(LocalDate.of(2026, 8, 20), LocalDate.of(2026, 8, 22)),
                reservation(LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 12))));

        assertEquals(List.of(
                LocalDate.of(2026, 8, 10),
                LocalDate.of(2026, 8, 11),
                LocalDate.of(2026, 8, 20),
                LocalDate.of(2026, 8, 21)), dates);
    }

    @Test
    void expandDates_emptyList_returnsEmptyList() {
        assertTrue(RoomReservationService.expandBookedDates(List.of()).isEmpty());
    }

    @Test
    void getAllReservations_unsortedPageable_defaultsToCreatedAtDesc() {
        Pageable result = RoomReservationService.applyDefaultSortIfUnsorted(PageRequest.of(0, 20));

        assertEquals(Sort.by(Sort.Direction.DESC, "createdAt"), result.getSort());
        assertEquals(0, result.getPageNumber());
        assertEquals(20, result.getPageSize());
    }

    @Test
    void getAllReservations_explicitSort_isPreserved() {
        Sort explicit = Sort.by(Sort.Direction.ASC, "totalPrice");
        Pageable result = RoomReservationService.applyDefaultSortIfUnsorted(PageRequest.of(0, 20, explicit));

        assertEquals(explicit, result.getSort());
        assertEquals(0, result.getPageNumber());
        assertEquals(20, result.getPageSize());
    }

    @Test
    void expireReservation_setsStatusToCancelled() {
        RoomReservation reservation = new RoomReservation();
        RoomReservationService.expireReservation(reservation);
        assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
    }

    @Test
    void expireReservation_setsUpdatedAtToNow() {
        RoomReservation reservation = new RoomReservation();
        RoomReservationService.expireReservation(reservation);
        assertFalse(reservation.getUpdatedAt().isBefore(reservation.getCreatedAt()));
        assertFalse(reservation.getUpdatedAt().isAfter(LocalDateTime.now()));
    }

    // --- helpers ---

    private RoomReservation reservation(LocalDate checkIn, LocalDate checkOut) {
        RoomReservation reservation = new RoomReservation();
        reservation.setCheckInDate(checkIn);
        reservation.setCheckOutDate(checkOut);
        reservation.setStatus(ReservationStatus.CONFIRMED);
        return reservation;
    }
}
