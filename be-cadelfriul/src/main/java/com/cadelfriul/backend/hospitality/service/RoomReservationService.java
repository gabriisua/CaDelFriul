package com.cadelfriul.backend.hospitality.service;

import com.cadelfriul.backend.core.exception.RoomNotAvailableException;
import com.cadelfriul.backend.hospitality.dto.RoomReservationRequestDTO;
import com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTO;
import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.Room;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import com.cadelfriul.backend.hospitality.repository.RoomReservationRepository;
import com.cadelfriul.backend.hospitality.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RoomReservationService {

    private final RoomReservationRepository roomReservationRepository;
    private final RoomRepository roomRepository;

    public RoomReservationService(RoomReservationRepository roomReservationRepository, RoomRepository roomRepository) {
        this.roomReservationRepository = roomReservationRepository;
        this.roomRepository = roomRepository;
    }

    public RoomReservationResponseDTO createReservation(RoomReservationRequestDTO request, String userId) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in date");
        }

        List<RoomReservation> overlaps = roomReservationRepository.findOverlappingReservations(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (!overlaps.isEmpty()) {
            throw new RoomNotAvailableException("Room is not available for the selected dates");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + request.getRoomId()));

        if (room.isArchived()) {
            throw new RoomNotAvailableException("Room is not available for the selected dates");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        RoomReservation reservation = new RoomReservation();
        reservation.setRoom(room);
        reservation.setUserId(userId);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setTotalPrice(totalPrice);
        reservation.setUpdatedAt(LocalDateTime.now());

        roomReservationRepository.save(reservation);
        return new RoomReservationResponseDTO(reservation);
    }

    @Transactional(readOnly = true)
    public List<RoomReservationResponseDTO> getReservationsForUser(String userId) {
        return roomReservationRepository.findByUserId(userId)
                .stream()
                .map(RoomReservationResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomReservationResponseDTO> getAllReservations() {
        return roomReservationRepository.findAll()
                .stream()
                .map(RoomReservationResponseDTO::new)
                .toList();
    }

    public RoomReservationResponseDTO updateReservationStatus(UUID id, ReservationStatus status) {
        RoomReservation reservation = roomReservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found with id: " + id));

        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());
        roomReservationRepository.save(reservation);
        return new RoomReservationResponseDTO(reservation);
    }
}
