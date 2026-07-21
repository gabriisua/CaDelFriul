package com.cadelfriul.backend.ecommerce.service;

import com.cadelfriul.backend.core.service.FileStorageService;
import com.cadelfriul.backend.ecommerce.dto.ProductCategoryRequest;
import com.cadelfriul.backend.ecommerce.dto.ProductCategoryResponse;
import com.cadelfriul.backend.ecommerce.dto.ProductRequest;
import com.cadelfriul.backend.ecommerce.dto.ProductResponse;
import com.cadelfriul.backend.ecommerce.entity.Product;
import com.cadelfriul.backend.ecommerce.entity.ProductCategory;
import com.cadelfriul.backend.ecommerce.entity.ProductImage;
import com.cadelfriul.backend.ecommerce.repository.ProductCategoryRepository;
import com.cadelfriul.backend.ecommerce.repository.ProductImageRepository;
import com.cadelfriul.backend.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AdminProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductImageRepository productImageRepository;
    private final FileStorageService fileStorageService;

    public AdminProductService(ProductRepository productRepository,
                               ProductCategoryRepository productCategoryRepository,
                               ProductImageRepository productImageRepository,
                               FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.productImageRepository = productImageRepository;
        this.fileStorageService = fileStorageService;
    }

    public ProductCategoryResponse createCategory(ProductCategoryRequest request) {
        if (productCategoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name '" + request.getName() + "' already exists");
        }
        ProductCategory category = new ProductCategory(request.getName(), request.getDescription());
        category = productCategoryRepository.save(category);
        return new ProductCategoryResponse(category);
    }

    public ProductCategoryResponse updateCategory(UUID id, ProductCategoryRequest request) {
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        category = productCategoryRepository.save(category);
        return new ProductCategoryResponse(category);
    }

    public void deleteCategory(UUID id) {
        if (!productCategoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        productCategoryRepository.deleteById(id);
    }

    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        applyProductRequest(product, request);
        product = productRepository.save(product);
        return toResponse(product);
    }

    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        applyProductRequest(product, request);
        product = productRepository.save(product);
        return toResponse(product);
    }

    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public ProductImage addImage(UUID productId, byte[] imageData, String contentType, String fileName) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        String imageUrl = fileStorageService.storeFile("products", productId, imageData, contentType, fileName);

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setFileName(fileName);
        image.setContentType(contentType);
        image.setImageUrl(imageUrl);

        return productImageRepository.save(image);
    }

    private void applyProductRequest(Product product, ProductRequest request) {
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setAvailable(request.isAvailable());
        if (request.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }
        if (request.getAttributes() != null) product.setAttributes(request.getAttributes());
    }

    private ProductResponse toResponse(Product product) {
        // Tipizziamo come String invece che UUID
        List<String> imageIds = productImageRepository.findByProductId(product.getId())
                .stream()
                // ATTENZIONE QUI: Prendi il NOME FILE (verifica come si chiama il getter nella tua entità)
                .map(ProductImage::getFileName)
                .toList();

        return new ProductResponse(product, imageIds);
    }
}