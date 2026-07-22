---
id: 260722-dql
slug: apply-multi-upload-pattern-to-products-m
description: Apply multi-upload pattern to Products matching Room implementation
status: complete
date: 2026-07-22
---

# Summary: Apply Multi-Upload Pattern to Products

## What Was Done

Updated the Product entity and related services to support multiple file uploads, matching the Room implementation pattern.

### Changes Made

1. **Product Entity** (`Product.java`)
   - Added `@ElementCollection` field `imageUrls` to store image URLs directly on the entity
   - Added getter and setter for `imageUrls`

2. **ProductResponse DTO** (`ProductResponse.java`)
   - Renamed `imageIds` field to `imageUrls`
   - Updated constructor and getter accordingly

3. **AdminProductController** (`AdminProductController.java`)
   - Changed `uploadImage` to `uploadImages` accepting `List<MultipartFile> files`
   - Updated return type to `ResponseEntity<List<String>>`
   - Updated OpenAPI annotations for multi-file upload

4. **AdminProductService** (`AdminProductService.java`)
   - New `addImages` method accepts `List<MultipartFile> files`
   - Iterates through files, validates each (not empty, is image)
   - Stores each file via `fileStorageService.storeFile()`
   - Collects all URLs and adds to `product.getImageUrls()`
   - Saves product once after all files processed
   - Removed dependency on `ProductImageRepository`

5. **PublicProductService** (`PublicProductService.java`)
   - Removed `ProductImageRepository` dependency
   - Updated `toResponse` to use `product.getImageUrls()` directly
   - Removed `getImage` method (can be added back if needed)

### Files Modified
- `src/main/java/com/cadelfriul/backend/ecommerce/entity/Product.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/dto/ProductResponse.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/controller/AdminProductController.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/service/AdminProductService.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/service/PublicProductService.java`

### Files Not Modified (kept for backward compatibility)
- `src/main/java/com/cadelfriul/backend/ecommerce/entity/ProductImage.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/repository/ProductImageRepository.java`

## Verification

- Code compiles successfully with `./gradlew compileJava`
- Product entity now stores image URLs directly via `@ElementCollection`
- Controller accepts multiple files via `@RequestParam("files") List<MultipartFile>`
- Service handles batch upload and single save operation

## Notes

- The `ProductImage` entity and `ProductImageRepository` are kept but no longer used by the main services
- The new pattern is simpler and matches the Room implementation
- Database migration may be needed to migrate existing product images from `product_images` table to the new `@ElementCollection` structure
