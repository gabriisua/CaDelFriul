package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.Product;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ProductResponse {

    private final UUID id;
    private final String name;
    private final String description;
    private final BigDecimal price;
    private final int stockQuantity;
    private final boolean isAvailable;
    private final UUID categoryId;
    private final String categoryName;
    private final Map<String, String> attributes;
    private final List<UUID> imageIds;

    public ProductResponse(Product product, List<UUID> imageIds) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.stockQuantity = product.getStockQuantity();
        this.isAvailable = product.isAvailable();
        this.categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        this.categoryName = product.getCategory() != null ? product.getCategory().getName() : null;
        this.attributes = product.getAttributes();
        this.imageIds = imageIds;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public int getStockQuantity() { return stockQuantity; }
    public boolean isAvailable() { return isAvailable; }
    public UUID getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public Map<String, String> getAttributes() { return attributes; }
    public List<UUID> getImageIds() { return imageIds; }
}
