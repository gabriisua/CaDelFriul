package com.cadelfriul.backend.hospitality.dto;

import com.cadelfriul.backend.hospitality.entity.BookingStatus;
import com.cadelfriul.backend.hospitality.entity.RoomBooking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class RoomBookingResponse {

    private final UUID id;
    private final UUID roomId;
    private final String userEmail;
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final BigDecimal totalPrice;
    private final BookingStatus status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public RoomBookingResponse(RoomBooking booking) {
        this.id = booking.getId();
        this.roomId = booking.getRoomId();
        this.userEmail = booking.getUserEmail();
        this.checkInDate = booking.getCheckInDate();
        this.checkOutDate = booking.getCheckOutDate();
        this.totalPrice = booking.getTotalPrice();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
        this.updatedAt = booking.getUpdatedAt();
    }

    public UUID getId() { return id; }
    public UUID getRoomId() { return roomId; }
    public String getUserEmail() { return userEmail; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public BookingStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
