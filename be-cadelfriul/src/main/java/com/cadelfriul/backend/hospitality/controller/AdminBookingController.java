package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.hospitality.dto.RoomBookingResponse;
import com.cadelfriul.backend.hospitality.entity.BookingStatus;
import com.cadelfriul.backend.hospitality.service.RoomBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Admin Bookings", description = "Admin endpoints for managing room bookings")
public class AdminBookingController {

    private final RoomBookingService roomBookingService;

    public AdminBookingController(RoomBookingService roomBookingService) {
        this.roomBookingService = roomBookingService;
    }

    @GetMapping
    @Operation(summary = "List all bookings", description = "Get all room bookings")
    public ResponseEntity<List<RoomBookingResponse>> getAllBookings() {
        return ResponseEntity.ok(roomBookingService.getAllBookings());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status", description = "Update the status of a specific booking")
    public ResponseEntity<RoomBookingResponse> updateBookingStatus(
            @PathVariable UUID id,
            @RequestBody BookingStatus status) {
        return ResponseEntity.ok(roomBookingService.updateBookingStatus(id, status));
    }
}
