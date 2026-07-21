package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.hospitality.dto.RoomRequest;
import com.cadelfriul.backend.hospitality.dto.RoomResponse;
import com.cadelfriul.backend.hospitality.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/rooms")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Admin Rooms", description = "Admin endpoints for managing rooms")
public class AdminRoomController {

    private final RoomService roomService;

    public AdminRoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    @Operation(summary = "Create room", description = "Create a new room")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update room", description = "Update an existing room")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable UUID id, @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive room", description = "Soft-delete a room by setting isArchived = true")
    public ResponseEntity<Void> archiveRoom(@PathVariable UUID id) {
        roomService.archiveRoom(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "List all rooms (admin)", description = "Get all rooms including archived ones")
    public ResponseEntity<List<RoomResponse>> getAllAdminRooms() {
        return ResponseEntity.ok(roomService.getAllAdminRooms());
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload room image", description = "Upload an image file for a room")
    public ResponseEntity<String> uploadImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("File must be an image");
        }

        String imageUrl = roomService.addImage(id, file.getBytes(), contentType, file.getOriginalFilename());
        return ResponseEntity.status(HttpStatus.CREATED).body(imageUrl);
    }
}
