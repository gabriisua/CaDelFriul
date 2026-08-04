package com.cadelfriul.backend.core.user.dto;

import com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTO;

public class CustomerDashboardResponse {

    private final RoomReservationResponseDTO upcomingReservation;
    private final long activeOrdersCount;
    private final long savedAddressesCount;

    public CustomerDashboardResponse(RoomReservationResponseDTO upcomingReservation,
                                     long activeOrdersCount,
                                     long savedAddressesCount) {
        this.upcomingReservation = upcomingReservation;
        this.activeOrdersCount = activeOrdersCount;
        this.savedAddressesCount = savedAddressesCount;
    }

    public RoomReservationResponseDTO getUpcomingReservation() { return upcomingReservation; }
    public long getActiveOrdersCount() { return activeOrdersCount; }
    public long getSavedAddressesCount() { return savedAddressesCount; }
}
