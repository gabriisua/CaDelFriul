package com.cadelfriul.backend.hospitality.service;

import com.cadelfriul.backend.core.service.FileStorageService;
import com.cadelfriul.backend.hospitality.dto.RoomRequest;
import com.cadelfriul.backend.hospitality.dto.RoomResponse;
import com.cadelfriul.backend.hospitality.entity.Room;
import com.cadelfriul.backend.hospitality.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;

    public RoomService(RoomRepository roomRepository, FileStorageService fileStorageService) {
        this.roomRepository = roomRepository;
        this.fileStorageService = fileStorageService;
    }

    public RoomResponse createRoom(RoomRequest request) {
        Room room = new Room();
        applyRoomRequest(room, request);
        room = roomRepository.save(room);
        return new RoomResponse(room);
    }

    public RoomResponse updateRoom(UUID id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        applyRoomRequest(room, request);
        room = roomRepository.save(room);
        return new RoomResponse(room);
    }

    public RoomResponse getRoomById(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        return new RoomResponse(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllPublicRooms() {
        return roomRepository.findAllByIsArchivedFalse()
                .stream()
                .map(RoomResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllAdminRooms() {
        return roomRepository.findAll()
                .stream()
                .map(RoomResponse::new)
                .toList();
    }

    public void archiveRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        room.setArchived(true);
        roomRepository.save(room);
    }

    private void applyRoomRequest(Room room, RoomRequest request) {
        if (request.getName() != null) room.setName(request.getName());
        if (request.getDescription() != null) room.setDescription(request.getDescription());
        if (request.getPricePerNight() != null) room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        if (request.getAmenities() != null) room.setAmenities(request.getAmenities());
    }

    public String addImage(UUID roomId, byte[] imageData, String contentType, String fileName) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));

        String imageUrl = fileStorageService.storeFile("rooms", roomId, imageData, contentType, fileName);
        room.getImageUrls().add(imageUrl);
        roomRepository.save(room);

        return imageUrl;
    }

    public void deleteImage(UUID roomId, String imageUrl) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));

        room.getImageUrls().remove(imageUrl);
        roomRepository.save(room);

        // Parse domain/entityId/filename from the imageUrl to delete the file
        // imageUrl format: /api/rooms/images/{uniqueFilename}
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        fileStorageService.deleteFile("rooms", roomId, filename);
    }
}
