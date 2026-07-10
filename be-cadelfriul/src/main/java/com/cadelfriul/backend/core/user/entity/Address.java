package com.cadelfriul.backend.core.auth.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "customer_addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Colleghiamo l'indirizzo al cliente proprietario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String street; // Es. "Via Udine"

    @Column(nullable = false)
    private String houseNumber; // Es. "12/A"

    @Column(nullable = false)
    private String city; // Es. "Tarcento"

    @Column(nullable = false, length = 10)
    private String zipCode; // Es. "33017"

    @Column(nullable = false, length = 50)
    private String province; // Es. "Udine" o "UD"

    @Column(nullable = false, length = 100)
    private String country; // Es. "Italia"

    @Column(length = 500)
    private String additionalInfo; // Es. "Citofonare Rossi", "Secondo piano"

    // Flags per capire l'utilizzo dell'indirizzo
    @Column(nullable = false)
    private boolean isDefaultShipping = false;

    @Column(nullable = false)
    private boolean isDefaultBilling = false;

    // --- Costruttori ---
    public Address() {}

    public Address(Customer customer, String street, String houseNumber, String city, String zipCode, String province, String country) {
        this.customer = customer;
        this.street = street;
        this.houseNumber = houseNumber;
        this.city = city;
        this.zipCode = zipCode;
        this.province = province;
        this.country = country;
    }

    // --- Getter & Setter ---
    public UUID getId() { return id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }

    public boolean isDefaultShipping() { return isDefaultShipping; }
    public void setDefaultShipping(boolean defaultShipping) { isDefaultShipping = defaultShipping; }

    public boolean isDefaultBilling() { return isDefaultBilling; }
    public void setDefaultBilling(boolean defaultBilling) { isDefaultBilling = defaultBilling; }
}