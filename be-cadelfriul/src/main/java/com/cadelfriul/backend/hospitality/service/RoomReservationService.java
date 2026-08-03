package com.cadelfriul.backend.hospitality.service;

import com.cadelfriul.backend.core.exception.RoomNotAvailableException;
import com.cadelfriul.backend.hospitality.dto.RoomReservationRequestDTO;
import com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTO;
import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.Room;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import com.cadelfriul.backend.hospitality.repository.RoomReservationRepository;
import com.cadelfriul.backend.hospitality.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import java.util.UUID;

@Service
@Transactional
public class RoomReservationService {

    private static final Logger log = LoggerFactory.getLogger(RoomReservationService.class);

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
    public List<LocalDate> getBookedDates(UUID roomId) {
        return expandBookedDates(roomReservationRepository.findByRoom_IdAndStatus(roomId, ReservationStatus.CONFIRMED));
    }

    /**
     * Expands each reservation's [checkInDate, checkOutDate) range into its individual dates
     * (check-in inclusive, check-out exclusive), de-duplicated and sorted ascending.
     * Does not touch reservation.getRoom() — it is LAZY; the query already filtered by room.id.
     */
    static List<LocalDate> expandBookedDates(List<RoomReservation> reservations) {
        TreeSet<LocalDate> bookedDates = new TreeSet<>();
        for (RoomReservation reservation : reservations) {
            LocalDate date = reservation.getCheckInDate();
            LocalDate checkOutDate = reservation.getCheckOutDate();
            long nights = ChronoUnit.DAYS.between(date, checkOutDate);
            for (long i = 0; i < nights; i++) {
                bookedDates.add(date.plusDays(i));
            }
        }
        return new ArrayList<>(bookedDates);
    }

    @Transactional(readOnly = true)
    public List<RoomReservationResponseDTO> getReservationsForUser(String userId) {
        return roomReservationRepository.findByUserId(userId)
                .stream()
                .map(RoomReservationResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<RoomReservationResponseDTO> getAllReservations(Pageable pageable) {
        return roomReservationRepository.findAll(pageable).map(RoomReservationResponseDTO::new);
    }

    public RoomReservationResponseDTO updateReservationStatus(UUID id, ReservationStatus status) {
        RoomReservation reservation = roomReservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found with id: " + id));

        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());
        roomReservationRepository.save(reservation);
        return new RoomReservationResponseDTO(reservation);
    }

    public boolean cancelReservation(UUID reservationId) {
        return roomReservationRepository.findById(reservationId)
                .map(reservation -> {
                    reservation.setStatus(ReservationStatus.CANCELLED);
                    reservation.setUpdatedAt(LocalDateTime.now());
                    roomReservationRepository.save(reservation);
                    return true;
                })
                .orElse(false);
    }

    public boolean confirmReservationIfAvailable(UUID reservationId) {
        return roomReservationRepository.findById(reservationId)
                .map(reservation -> {
                    List<RoomReservation> overlaps = roomReservationRepository.findOverlappingReservations(
                            reservation.getRoom().getId(),
                            reservation.getCheckInDate(),
                            reservation.getCheckOutDate()
                    );

                    if (overlaps.isEmpty()) {
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                    } else {
                        reservation.setStatus(ReservationStatus.CANCELLED);
                        log.warn("Reservation {} cancelled after payment: dates no longer available ({} CONFIRMED overlap(s))",
                                reservationId, overlaps.size());
                    }

                    reservation.setUpdatedAt(LocalDateTime.now());
                    roomReservationRepository.save(reservation);
                    return true;
                })
                .orElse(false);
    }
}
