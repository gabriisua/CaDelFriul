package com.cadelfriul.backend.hospitality.dto;

import com.cadelfriul.backend.hospitality.entity.Room;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RoomResponse {

    private final UUID id;
    private final String name;
    private final String description;
    private final BigDecimal pricePerNight;
    private final int capacity;
    private final List<String> amenities;
    private final List<String> imageUrls;
    private final boolean isArchived;

    public RoomResponse(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.description = room.getDescription();
        this.pricePerNight = room.getPricePerNight();
        this.capacity = room.getCapacity();
        this.amenities = room.getAmenities();
        this.imageUrls = room.getImageUrls() != null ? room.getImageUrls() : new ArrayList<>();
        this.isArchived = room.isArchived();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPricePerNight() { return pricePerNight; }
    public int getCapacity() { return capacity; }
    public List<String> getAmenities() { return amenities; }
    public List<String> getImageUrls() { return imageUrls; }
    public boolean isArchived() { return isArchived; }
}
