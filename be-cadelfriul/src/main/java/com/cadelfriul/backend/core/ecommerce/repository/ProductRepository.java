package com.cadelfriul.backend.core.ecommerce.repository;

import com.cadelfriul.backend.core.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByIsAvailableTrue();

    List<Product> findByIsAvailableTrueAndCategoryId(UUID categoryId);

    @Query("""
            SELECT p FROM Product p
            WHERE p.isAvailable = true
            AND (:categoryId IS NULL OR p.category.id = :categoryId)
            AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            """)
    List<Product> findAvailableProducts(@Param("categoryId") UUID categoryId,
                                        @Param("search") String search,
                                        @Param("minPrice") BigDecimal minPrice,
                                        @Param("maxPrice") BigDecimal maxPrice);
}
