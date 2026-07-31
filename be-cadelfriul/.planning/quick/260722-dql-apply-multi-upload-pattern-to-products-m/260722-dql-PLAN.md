---
id: 260722-dql
slug: apply-multi-upload-pattern-to-products-m
description: Apply multi-upload pattern to Products matching Room implementation
date: 2026-07-22
---

# Plan: Apply Multi-Upload Pattern to Products

## Task 1: Update Product Entity to use @ElementCollection

**Files:**
- `src/main/java/com/cadelfriul/backend/ecommerce/entity/Product.java`

**Actions:**
1. Add `import java.util.ArrayList;` and `import java.util.List;`
2. Add new field:
   ```java
   @ElementCollection
   @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
   @Column(name = "image_url")
   private List<String> imageUrls = new ArrayList<>();
   ```
3. Add getter and setter for `imageUrls`

**Verify:** Entity compiles and has both the field and accessor methods

---

## Task 2: Update ProductResponse DTO

**Files:**
- `src/main/java/com/cadelfriul/backend/ecommerce/dto/ProductResponse.java`

**Actions:**
1. Rename `imageIds` field to `imageUrls`
2. Update constructor to accept `List<String> imageUrls`
3. Update getter name from `getImageIds()` to `getImageUrls()`

**Verify:** DTO compiles and field name matches entity

---

## Task 3: Update AdminProductController for Multi-Upload

**Files:**
- `src/main/java/com/cadelfriul/backend/ecommerce/controller/AdminProductController.java`

**Actions:**
1. Add `import java.util.List;`
2. Change `uploadImage` method parameter from `@RequestParam("file") MultipartFile file` to `@RequestParam("files") List<MultipartFile> files`
3. Update method body to handle multiple files
4. Update return type to `ResponseEntity<List<String>>`
5. Update OpenAPI annotation for multi-file upload

**Verify:** Controller accepts multiple files and returns list of URLs

---

## Task 4: Update AdminProductService for Multi-Upload

**Files:**
- `src/main/java/com/cadelfriul/backend/ecommerce/service/AdminProductService.java`

**Actions:**
1. Update `addImage` method signature to accept `List<MultipartFile> files`
2. Iterate through files list
3. For each file: validate (not empty, is image), store via `fileStorageService.storeFile()`
4. Collect all URLs and add to `product.getImageUrls()`
5. Save product once after all files processed
6. Return list of URLs

**Verify:** Service handles multiple files and updates product entity correctly

---

## Task 5: Update PublicProductService

**Files:**
- `src/main/java/com/cadelfriul/backend/ecommerce/service/PublicProductService.java`

**Actions:**
1. Remove `ProductImageRepository` dependency
2. Update `toResponse` method to use `product.getImageUrls()` instead of querying ProductImageRepository
3. Remove `getImage` method (or keep for backward compatibility)

**Verify:** Public service returns products with imageUrls from entity

---

## Success Criteria

- [ ] Product entity has `imageUrls` as `@ElementCollection`
- [ ] ProductResponse DTO uses `imageUrls` field
- [ ] Controller accepts multiple files via `@RequestParam("files") List<MultipartFile>`
- [ ] Service iterates through files and stores each one
- [ ] Service adds all URLs to product.imageUrls in single save
- [ ] PublicProductService uses entity's imageUrls
