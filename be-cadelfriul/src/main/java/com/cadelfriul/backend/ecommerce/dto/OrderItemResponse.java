package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.OrderItem;
import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemResponse {

    private final UUID id;
    private final UUID productId;
    private final String productName;
    private final int quantity;
    private final BigDecimal priceAtPurchase;
    private final BigDecimal lineTotal;

    public OrderItemResponse(OrderItem orderItem) {
        this.id = orderItem.getId();
        this.productId = orderItem.getProduct().getId();
        this.productName = orderItem.getProduct().getName();
        this.quantity = orderItem.getQuantity();
        this.priceAtPurchase = orderItem.getPriceAtPurchase();
        this.lineTotal = orderItem.getPriceAtPurchase().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPriceAtPurchase() { return priceAtPurchase; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
