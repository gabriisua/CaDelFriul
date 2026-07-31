package com.cadelfriul.backend.ecommerce.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "product_categories")
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    public ProductCategory() {}

    public ProductCategory(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
