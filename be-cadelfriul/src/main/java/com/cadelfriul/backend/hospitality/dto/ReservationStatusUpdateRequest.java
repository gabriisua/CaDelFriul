package com.cadelfriul.backend.hospitality.dto;

import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record ReservationStatusUpdateRequest(@NotNull ReservationStatus status) {}
