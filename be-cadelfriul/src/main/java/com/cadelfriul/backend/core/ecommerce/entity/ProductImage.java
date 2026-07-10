package com.cadelfriul.backend.core.ecommerce.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Lob
    @Column(name = "image_data", nullable = false, columnDefinition = "BYTEA")
    private byte[] imageData;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_name")
    private String fileName;

    public ProductImage() {}

    public ProductImage(Product product, byte[] imageData, String contentType, String fileName) {
        this.product = product;
        this.imageData = imageData;
        this.contentType = contentType;
        this.fileName = fileName;
    }

    public UUID getId() { return id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
