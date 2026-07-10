package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderResponse {

    private final UUID id;
    private final UUID customerId;
    private final String customerEmail;
    private final UUID shippingAddressId;
    private final BigDecimal totalAmount;
    private final OrderStatus status;
    private final LocalDateTime createdAt;
    private final List<OrderItemResponse> items;

    public OrderResponse(Order order, List<OrderItemResponse> items) {
        this.id = order.getId();
        this.customerId = order.getCustomer().getId();
        this.customerEmail = order.getCustomer().getEmail();
        this.shippingAddressId = order.getShippingAddress().getId();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.createdAt = order.getCreatedAt();
        this.items = items;
    }

    public UUID getId() { return id; }
    public UUID getCustomerId() { return customerId; }
    public String getCustomerEmail() { return customerEmail; }
    public UUID getShippingAddressId() { return shippingAddressId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemResponse> getItems() { return items; }
}
