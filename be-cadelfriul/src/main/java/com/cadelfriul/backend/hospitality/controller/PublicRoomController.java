package com.cadelfriul.backend.hospitality.controller;

import com.cadelfriul.backend.core.service.FileStorageService;
import com.cadelfriul.backend.hospitality.dto.RoomResponse;
import com.cadelfriul.backend.hospitality.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Public Rooms", description = "Public endpoints for browsing available rooms")
public class PublicRoomController {

    private final RoomService roomService;
    private final FileStorageService fileStorageService;

    public PublicRoomController(RoomService roomService, FileStorageService fileStorageService) {
        this.roomService = roomService;
        this.fileStorageService = fileStorageService;
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

    /**
     * Serve room image by roomId and filename.
     * URL format: /api/rooms/{roomId}/images/{filename}
     */
    @GetMapping("/{roomId}/images/{filename:.+}")
    @Operation(summary = "Get room image", description = "Serve a room image by roomId and filename")
    public ResponseEntity<Resource> getImage(@PathVariable UUID roomId, @PathVariable String filename) {
        try {
            Resource resource = fileStorageService.loadFile("rooms", roomId, filename);

            if (resource != null) {
                Path filePath = resource.getFile().toPath();
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
