package com.cadelfriul.backend.hospitality.repository;

import com.cadelfriul.backend.hospitality.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByIsArchivedFalse();
}
