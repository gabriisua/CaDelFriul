package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.OrderItem;
import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal vatRate; // NUOVO
    private BigDecimal lineTotal;

    public OrderItemResponse(OrderItem item) {
        this.id = item.getId();
        this.productId = item.getProduct().getId();
        this.productName = item.getProduct().getName();
        this.quantity = item.getQuantity();
        this.priceAtPurchase = item.getPriceAtPurchase();
        this.vatRate = item.getVatRate(); // NUOVO
        this.lineTotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    // Aggiungi qui i Getter e Setter
    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPriceAtPurchase() { return priceAtPurchase; }
    public BigDecimal getVatRate() { return vatRate; }
    public BigDecimal getLineTotal() { return lineTotal; }
}