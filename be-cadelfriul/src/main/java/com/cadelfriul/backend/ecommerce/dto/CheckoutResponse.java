package com.cadelfriul.backend.ecommerce.dto;

import java.util.UUID;

public class CheckoutResponse {

    private UUID orderId;
    private String sessionUrl;

    public CheckoutResponse(UUID orderId, String sessionUrl) {
        this.orderId = orderId;
        this.sessionUrl = sessionUrl;
    }

    public UUID getOrderId() { return orderId; }
    public String getSessionUrl() { return sessionUrl; }
}
