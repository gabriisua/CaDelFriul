package com.cadelfriul.backend.hospitality.scheduler;

import com.cadelfriul.backend.hospitality.service.RoomReservationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReservationCleanupScheduler {

    private final RoomReservationService roomReservationService;

    public ReservationCleanupScheduler(RoomReservationService roomReservationService) {
        this.roomReservationService = roomReservationService;
    }

    @Scheduled(fixedRate = 900000)
    public void cleanupExpiredPendingReservations() {
        roomReservationService.cancelExpiredPendingReservations();
    }
}
