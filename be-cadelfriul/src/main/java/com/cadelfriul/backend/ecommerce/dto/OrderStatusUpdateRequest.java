package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(@NotNull OrderStatus status) {}
