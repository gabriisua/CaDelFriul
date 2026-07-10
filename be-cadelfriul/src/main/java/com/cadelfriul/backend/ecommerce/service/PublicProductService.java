package com.cadelfriul.backend.ecommerce.service;

import com.cadelfriul.backend.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.ecommerce.entity.Product;
import com.cadelfriul.backend.ecommerce.entity.ProductImage;
import com.cadelfriul.backend.ecommerce.repository.ProductCategoryRepository;
import com.cadelfriul.backend.ecommerce.repository.ProductImageRepository;
import com.cadelfriul.backend.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublicProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductImageRepository productImageRepository;

    public PublicProductService(ProductRepository productRepository,
                                ProductCategoryRepository productCategoryRepository,
                                ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productImageRepository = productImageRepository;
    }

    public List<ProductResponse> getAvailableProducts(UUID categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.findAvailableProducts(categoryId, search, minPrice, maxPrice);
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

    public ProductImage getImage(UUID imageId) {
        return productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
    }

    private ProductResponse toResponse(Product product) {
        List<UUID> imageIds = productImageRepository.findByProductId(product.getId())
                .stream()
                .map(ProductImage::getId)
                .toList();
        return new ProductResponse(product, imageIds);
    }
}
