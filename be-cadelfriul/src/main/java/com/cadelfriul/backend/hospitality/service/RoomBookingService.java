package com.cadelfriul.backend.hospitality.service;

import com.cadelfriul.backend.hospitality.dto.RoomBookingRequest;
import com.cadelfriul.backend.hospitality.dto.RoomBookingResponse;
import com.cadelfriul.backend.hospitality.entity.BookingStatus;
import com.cadelfriul.backend.hospitality.entity.Room;
import com.cadelfriul.backend.hospitality.entity.RoomBooking;
import com.cadelfriul.backend.hospitality.repository.RoomBookingRepository;
import com.cadelfriul.backend.hospitality.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RoomBookingService {

    private final RoomBookingRepository roomBookingRepository;
    private final RoomRepository roomRepository;

    public RoomBookingService(RoomBookingRepository roomBookingRepository, RoomRepository roomRepository) {
        this.roomBookingRepository = roomBookingRepository;
        this.roomRepository = roomRepository;
    }

    public RoomBookingResponse createBooking(RoomBookingRequest request) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in date");
        }

        List<RoomBooking> overlaps = roomBookingRepository.findOverlappingBookings(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (!overlaps.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is not available for the selected dates");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + request.getRoomId()));

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        RoomBooking booking = new RoomBooking();
        booking.setRoomId(request.getRoomId());
        booking.setUserEmail(request.getUserEmail());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);
        booking.setUpdatedAt(LocalDateTime.now());

        roomBookingRepository.save(booking);
        return new RoomBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<RoomBookingResponse> getAllBookings() {
        return roomBookingRepository.findAll()
                .stream()
                .map(RoomBookingResponse::new)
                .toList();
    }

    public RoomBookingResponse updateBookingStatus(UUID id, BookingStatus status) {
        RoomBooking booking = roomBookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with id: " + id));

        booking.setStatus(status);
        booking.setUpdatedAt(LocalDateTime.now());
        roomBookingRepository.save(booking);
        return new RoomBookingResponse(booking);
    }
}
