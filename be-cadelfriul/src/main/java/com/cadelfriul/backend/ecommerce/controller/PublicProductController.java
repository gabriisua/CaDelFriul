package com.cadelfriul.backend.core.ecommerce.controller;

import com.cadelfriul.backend.core.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.core.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.core.ecommerce.entity.ProductImage;
import com.cadelfriul.backend.core.ecommerce.service.PublicProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Public Products", description = "Public endpoints for browsing products")
public class PublicProductController {

    private final PublicProductService publicProductService;

    public PublicProductController(PublicProductService publicProductService) {
        this.publicProductService = publicProductService;
    }

    @GetMapping
    @Operation(summary = "List available products", description = "Get all available products with optional filters")
    public ResponseEntity<List<ProductResponse>> getAvailableProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @io.swagger.v3.oas.annotations.media.Schema(type = "string") BigDecimal minPrice,
            @RequestParam(required = false) @io.swagger.v3.oas.annotations.media.Schema(type = "string") BigDecimal maxPrice) {
        return ResponseEntity.ok(publicProductService.getAvailableProducts(categoryId, search, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Get a single product by its ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(publicProductService.getProductById(id));
    }

    @GetMapping("/categories")
    @Operation(summary = "List categories", description = "Get all product categories")
    public ResponseEntity<List<ProductCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(publicProductService.getAllCategories());
    }

    @GetMapping("/images/{imageId}")
    @Operation(summary = "Get product image", description = "Serve a product image by its ID")
    public ResponseEntity<byte[]> getImage(@PathVariable UUID imageId) {
        ProductImage image = publicProductService.getImage(imageId);
        MediaType mediaType = image.getContentType() != null
                ? MediaType.parseMediaType(image.getContentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(image.getImageData());
    }
}
