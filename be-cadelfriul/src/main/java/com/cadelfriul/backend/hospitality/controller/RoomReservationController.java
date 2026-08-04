package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.ecommerce.service.StripePaymentService;
import com.cadelfriul.backend.hospitality.dto.RoomReservationRequestDTO;
import com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTO;
import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.service.RoomReservationService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    private final StripePaymentService stripePaymentService;

    public RoomReservationController(RoomReservationService roomReservationService, StripePaymentService stripePaymentService) {
        this.roomReservationService = roomReservationService;
        this.stripePaymentService = stripePaymentService;
    }

    @PostMapping
    @Operation(summary = "Create a reservation")
    public ResponseEntity<RoomReservationResponseDTO> createReservation(@Valid @RequestBody RoomReservationRequestDTO request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        RoomReservationResponseDTO dto = roomReservationService.createReservation(request, userId);

        try {
            Session session = stripePaymentService.createRoomReservationCheckoutSession(
                    dto.getId(),
                    dto.getRoom().getName(),
                    dto.getTotalPrice());
            dto.setStripeCheckoutUrl(session.getUrl());
        } catch (StripeException e) {
            roomReservationService.cancelReservation(dto.getId());
            throw new RuntimeException("Failed to create Stripe checkout session: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/me")
    @Operation(summary = "Get my reservations")
    public ResponseEntity<List<RoomReservationResponseDTO>> getMyReservations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(roomReservationService.getReservationsForUser(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List all reservations (admin)",
            description = "Paginated admin listing (newest first by default). Query params: ?page=0&size=20&sort=createdAt,desc")
    public ResponseEntity<Page<RoomReservationResponseDTO>> getAllReservations(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(roomReservationService.getAllReservations(pageable));
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
