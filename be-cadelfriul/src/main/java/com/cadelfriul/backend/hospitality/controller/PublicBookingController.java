package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.hospitality.dto.RoomBookingRequest;
import com.cadelfriul.backend.hospitality.dto.RoomBookingResponse;
import com.cadelfriul.backend.hospitality.service.RoomBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Public Bookings", description = "Public endpoints for creating room bookings")
public class PublicBookingController {

    private final RoomBookingService roomBookingService;

    public PublicBookingController(RoomBookingService roomBookingService) {
        this.roomBookingService = roomBookingService;
    }

    @PostMapping
    @Operation(summary = "Create a booking", description = "Create a new room booking")
    public ResponseEntity<RoomBookingResponse> createBooking(@Valid @RequestBody RoomBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomBookingService.createBooking(request));
    }
}
