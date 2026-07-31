package com.cadelfriul.backend.core.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_logs")
public class CustomerLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relazione Molti-a-Uno: Molti log appartengono a un singolo Customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String action; // Es. "REGISTERED", "PASSWORD_CHANGED", "ADDRESS_UPDATED"

    @Column(length = 1000)
    private String details;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // --- Costruttori ---
    public CustomerLog() {
        this.timestamp = LocalDateTime.now();
    }

    public CustomerLog(Customer customer, String action, String details) {
        this.customer = customer;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getter & Setter ---
    public UUID getId() { return id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
}