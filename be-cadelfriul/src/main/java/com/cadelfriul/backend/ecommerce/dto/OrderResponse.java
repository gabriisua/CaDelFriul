package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderResponse {
    private UUID id;
    private LocalDateTime createdAt;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String stripeSessionId;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private CustomerSummaryDTO customer;
    private AddressDTO shippingAddress;
    private AddressDTO billingAddress;
    private List<OrderItemResponse> items;

    public OrderResponse(Order order, List<OrderItemResponse> items) {
        this.id = order.getId();
        this.createdAt = order.getCreatedAt();
        this.status = order.getStatus();
        this.paymentStatus = order.getPaymentStatus();
        this.stripeSessionId = order.getStripeSessionId();
        this.shippingCost = order.getShippingCost();
        this.totalAmount = order.getTotalAmount();

        this.subtotal = items.stream()
                .map(OrderItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.customer = new CustomerSummaryDTO(order.getCustomer());
        this.shippingAddress = new AddressDTO(order.getShippingAddress());
        this.billingAddress = order.getBillingAddress() != null
                ? new AddressDTO(order.getBillingAddress())
                : null;
        this.items = items;
    }

    public UUID getId() { return id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public OrderStatus getStatus() { return status; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public String getStripeSessionId() { return stripeSessionId; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public CustomerSummaryDTO getCustomer() { return customer; }
    public AddressDTO getShippingAddress() { return shippingAddress; }
    public AddressDTO getBillingAddress() { return billingAddress; }
    public List<OrderItemResponse> getItems() { return items; }
}
