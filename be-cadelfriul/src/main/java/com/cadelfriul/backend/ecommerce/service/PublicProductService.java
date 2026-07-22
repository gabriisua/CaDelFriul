package com.cadelfriul.backend.ecommerce.service;

import com.cadelfriul.backend.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.ecommerce.entity.Product;
import com.cadelfriul.backend.ecommerce.repository.ProductCategoryRepository;
import com.cadelfriul.backend.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublicProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;

    public PublicProductService(ProductRepository productRepository,
                                ProductCategoryRepository productCategoryRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    public List<ProductResponse> getAvailableProducts(UUID categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice) {

        // TRUCCO ANTI-BUG: Se la ricerca è null, usiamo una stringa vuota.
        // Questo impedisce a PostgreSQL di castare il parametro come 'bytea'
        String safeSearch = (search == null) ? "" : search;

        // Usiamo safeSearch al posto di search
        List<Product> products = productRepository.findAvailableProducts(categoryId, safeSearch, minPrice, maxPrice);

        return products.stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toResponse(product);
    }

    public List<ProductCategoryResponse> getAllCategories() {
        return productCategoryRepository.findAll()
                .stream()
                .map(ProductCategoryResponse::new)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        List<String> imageUrls = product.getImageUrls() != null ? product.getImageUrls() : new ArrayList<>();
        return new ProductResponse(product, imageUrls);
    }
}
