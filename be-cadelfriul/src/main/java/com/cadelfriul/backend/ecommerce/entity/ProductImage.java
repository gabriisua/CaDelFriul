package com.cadelfriul.backend.ecommerce.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String imageUrl;
    private String fileName;
    private String contentType;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // Costruttore vuoto (Obbligatorio per Spring Boot / Hibernate)
    public ProductImage() {
    }

    // --- GETTER E SETTER ---

    public UUID getId() { return id; }
    // (L'ID di solito non ha il setter perché viene generato in automatico)

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}