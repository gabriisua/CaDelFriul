package com.cadelfriul.backend.hospitality.repository;

import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomReservationRepository extends JpaRepository<RoomReservation, UUID> {

    List<RoomReservation> findByUserId(String userId);

    Optional<RoomReservation> findFirstByUserIdAndStatusAndCheckInDateGreaterThanEqualOrderByCheckInDateAsc(
            String userId, ReservationStatus status, LocalDate checkInDate);

    List<RoomReservation> findByRoom_IdAndStatus(UUID roomId, ReservationStatus status);

    List<RoomReservation> findByStatusAndCreatedAtBefore(ReservationStatus status, LocalDateTime threshold);

    @Query("SELECT r FROM RoomReservation r WHERE r.room.id = :roomId " +
           "AND r.status = com.cadelfriul.backend.hospitality.entity.ReservationStatus.CONFIRMED " +
           "AND r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate")
    List<RoomReservation> findOverlappingReservations(
            @Param("roomId") UUID roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate);

    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM RoomReservation r WHERE r.status = :status")
    BigDecimal sumConfirmedReservationsRevenue(@Param("status") ReservationStatus status);
}
