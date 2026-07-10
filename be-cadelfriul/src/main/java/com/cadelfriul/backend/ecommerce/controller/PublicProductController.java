package com.cadelfriul.backend.ecommerce.controller;

import com.cadelfriul.backend.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.ecommerce.service.PublicProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Public Products", description = "Public endpoints for browsing products")
public class PublicProductController {

    private final PublicProductService publicProductService;

    // Aggiungiamo la lettura della cartella esattamente come nel Service
    @Value("${app.storage.upload-dir:uploads/products}")
    private String uploadDir;

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

    // --- ENDPOINT IMMAGINE AGGIORNATO ---
    // Il ":.+" serve a dire a Spring di non tagliare l'estensione del file (es. .jpg o .png)
    @GetMapping("/images/{filename:.+}")
    @Operation(summary = "Get product image", description = "Serve a product image by its filename")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            // 1. Cerca il file nella cartella su disco
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // 2. Se il file esiste, lo spara al browser
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream"; // Fallback generico
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build(); // 404 Se l'immagine non c'è
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build(); // 500 in caso di errore di lettura
        }
    }
}