package com.cadelfriul.backend.ecommerce.controller;

import com.cadelfriul.backend.core.service.FileStorageService;
import com.cadelfriul.backend.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.ecommerce.service.PublicProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Public Products", description = "Public endpoints for browsing products")
public class PublicProductController {

    private final PublicProductService publicProductService;
    private final FileStorageService fileStorageService;

    public PublicProductController(PublicProductService publicProductService,
                                   FileStorageService fileStorageService) {
        this.publicProductService = publicProductService;
        this.fileStorageService = fileStorageService;
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

    /**
     * Serve product image. Filename format: {UUID}_{originalFilename}
     * Extracts the productId prefix from the filename.
     */
    @GetMapping("/images/{filename:.+}")
    @Operation(summary = "Get product image", description = "Serve a product image by its filename")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            // Extract productId from filename format: {UUID}_{originalFilename}
            UUID productId = extractProductIdFromFilename(filename);
            if (productId == null) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = fileStorageService.loadFile("products", productId, filename);

            if (resource != null) {
                Path filePath = resource.getFile().toPath();
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Extract UUID productId from filename format: {UUID}_{originalFilename}
     * Returns null if the filename doesn't match the expected pattern.
     */
    private UUID extractProductIdFromFilename(String filename) {
        if (filename == null) return null;
        int separatorIndex = filename.indexOf('_');
        if (separatorIndex <= 0) return null;
        try {
            return UUID.fromString(filename.substring(0, separatorIndex));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}