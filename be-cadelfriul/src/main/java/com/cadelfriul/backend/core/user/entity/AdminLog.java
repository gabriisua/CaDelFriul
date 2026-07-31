package com.cadelfriul.backend.core.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_logs")
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relazione Molti-a-Uno: Molti log appartengono a un singolo Admin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Column(nullable = false)
    private String action; // Es. "UPDATE_ROOM_PRICE", "DELETE_BOOKING"

    @Column(length = 1000)
    private String details; // Es. "Cambiato il prezzo della stanza Suite da 150 a 180"

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // --- Costruttori ---
    public AdminLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AdminLog(Admin admin, String action, String details) {
        this.admin = admin;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getter & Setter ---
    public UUID getId() { return id; }

    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin admin) { this.admin = admin; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
}