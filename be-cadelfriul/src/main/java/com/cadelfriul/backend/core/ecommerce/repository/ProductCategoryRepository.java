package com.cadelfriul.backend.core.ecommerce.repository;

import com.cadelfriul.backend.core.ecommerce.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
    boolean existsByName(String name);
}
