package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.ecommerce.entity.ProductCategory;
import java.util.UUID;

public class ProductCategoryResponse {

    private final UUID id;
    private final String name;
    private final String description;

    public ProductCategoryResponse(ProductCategory category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
}
