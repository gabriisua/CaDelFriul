package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.hospitality.dto.RoomResponse;
import com.cadelfriul.backend.hospitality.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Public Rooms", description = "Public endpoints for browsing available rooms")
public class PublicRoomController {

    private final RoomService roomService;

    public PublicRoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    @Operation(summary = "List all active rooms", description = "Get all non-archived rooms")
    public ResponseEntity<List<RoomResponse>> getAllPublicRooms() {
        return ResponseEntity.ok(roomService.getAllPublicRooms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get room by ID", description = "Get a single room by its ID")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable UUID id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }
}
