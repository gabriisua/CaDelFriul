package com.cadelfriul.backend.hospitality.service;

import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

    // --- helpers ---

    private RoomReservation reservation(LocalDate checkIn, LocalDate checkOut) {
        RoomReservation reservation = new RoomReservation();
        reservation.setCheckInDate(checkIn);
        reservation.setCheckOutDate(checkOut);
        reservation.setStatus(ReservationStatus.CONFIRMED);
        return reservation;
    }
}
