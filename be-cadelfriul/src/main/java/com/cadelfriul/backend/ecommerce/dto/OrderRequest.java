package com.cadelfriul.backend.ecommerce.dto;

import java.util.List;
import java.util.UUID;

public class OrderRequest {

    private UUID shippingAddressId;
    private List<OrderItemRequest> items;

    public UUID getShippingAddressId() { return shippingAddressId; }
    public void setShippingAddressId(UUID shippingAddressId) { this.shippingAddressId = shippingAddressId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
