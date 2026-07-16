package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.Order;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderResponse {
    private UUID id;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;     // NUOVO
    private BigDecimal shippingCost; // NUOVO
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    // Aggiungi anche i dati del cliente e indirizzi se li avevi mappati!

    public OrderResponse(Order order, List<OrderItemResponse> items) {
        this.id = order.getId();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();
        this.shippingCost = order.getShippingCost(); // NUOVO

        // Calcoliamo il subtotale al volo (Totale - Spedizione)
        this.subtotal = order.getTotalAmount().subtract(order.getShippingCost());

        this.createdAt = order.getCreatedAt();
        this.items = items;
    }

    // Getter e Setter
    public UUID getId() { return id; }
    public OrderStatus getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemResponse> getItems() { return items; }
}