package com.cadelfriul.backend.hospitality.dto;

import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class RoomReservationResponseDTO {

    private final UUID id;
    private final RoomResponse room;
    private final String userId;
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final BigDecimal totalPrice;
    private final ReservationStatus status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public RoomReservationResponseDTO(RoomReservation reservation) {
        this.id = reservation.getId();
        this.room = new RoomResponse(reservation.getRoom());
        this.userId = reservation.getUserId();
        this.checkInDate = reservation.getCheckInDate();
        this.checkOutDate = reservation.getCheckOutDate();
        this.totalPrice = reservation.getTotalPrice();
        this.status = reservation.getStatus();
        this.createdAt = reservation.getCreatedAt();
        this.updatedAt = reservation.getUpdatedAt();
    }

    public UUID getId() { return id; }
    public RoomResponse getRoom() { return room; }
    public String getUserId() { return userId; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public ReservationStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
