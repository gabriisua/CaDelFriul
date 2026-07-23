package com.cadelfriul.backend.hospitality.repository;

import com.cadelfriul.backend.hospitality.entity.BookingStatus;
import com.cadelfriul.backend.hospitality.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RoomBookingRepository extends JpaRepository<RoomBooking, UUID> {

    @Query("SELECT b FROM RoomBooking b WHERE b.roomId = :roomId " +
           "AND b.status <> com.cadelfriul.backend.hospitality.entity.BookingStatus.CANCELLED " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<RoomBooking> findOverlappingBookings(
            @Param("roomId") UUID roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );
}
