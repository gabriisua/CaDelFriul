package com.cadelfriul.backend.core.ecommerce.controller;

import com.cadelfriul.backend.core.ecommerce.dto.ProductCategoryRequest;
import com.cadelfriul.backend.core.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.core.ecommerce.dto.ProductRequest;
import com.cadelfriul.backend.core.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.core.ecommerce.entity.ProductImage;
import com.cadelfriul.backend.core.ecommerce.service.AdminProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Admin Products", description = "Admin endpoints for managing products and categories")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @PostMapping("/categories")
    @Operation(summary = "Create category", description = "Create a new product category")
    public ResponseEntity<ProductCategoryResponse> createCategory(@RequestBody ProductCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update category", description = "Update an existing product category")
    public ResponseEntity<ProductCategoryResponse> updateCategory(@PathVariable UUID id,
                                                                   @RequestBody ProductCategoryRequest request) {
        return ResponseEntity.ok(adminProductService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete category", description = "Delete a product category")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        adminProductService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @Operation(summary = "Create product", description = "Create a new product")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.createProduct(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Update an existing product")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable UUID id,
                                                         @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminProductService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Delete a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image", description = "Upload a product image")
    public ResponseEntity<Void> uploadImage(@PathVariable UUID id,
                                            @RequestParam("file") MultipartFile file) throws IOException {
        adminProductService.addImage(id, file.getBytes(),
                file.getContentType(), file.getOriginalFilename());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
