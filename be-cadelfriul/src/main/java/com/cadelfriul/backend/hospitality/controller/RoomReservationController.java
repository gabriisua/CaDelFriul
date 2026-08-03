package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.hospitality.dto.RoomReservationRequestDTO;
import com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTO;
import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.service.RoomReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations/rooms")
@Tag(name = "Room Reservations", description = "Authenticated room reservation endpoints")
public class RoomReservationController {

    private final RoomReservationService roomReservationService;

    public RoomReservationController(RoomReservationService roomReservationService) {
        this.roomReservationService = roomReservationService;
    }

    @PostMapping
    @Operation(summary = "Create a reservation")
    public ResponseEntity<RoomReservationResponseDTO> createReservation(@Valid @RequestBody RoomReservationRequestDTO request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(roomReservationService.createReservation(request, userId));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my reservations")
    public ResponseEntity<List<RoomReservationResponseDTO>> getMyReservations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(roomReservationService.getReservationsForUser(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List all reservations (admin)")
    public ResponseEntity<List<RoomReservationResponseDTO>> getAllReservations() {
        return ResponseEntity.ok(roomReservationService.getAllReservations());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update reservation status (admin)")
    public ResponseEntity<RoomReservationResponseDTO> updateReservationStatus(
            @PathVariable UUID id,
            @RequestBody ReservationStatus status) {
        return ResponseEntity.ok(roomReservationService.updateReservationStatus(id, status));
    }
}
