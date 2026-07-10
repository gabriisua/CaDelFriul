package com.cadelfriul.backend.core.ecommerce.repository;

import com.cadelfriul.backend.core.ecommerce.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findByProductId(UUID productId);
}
