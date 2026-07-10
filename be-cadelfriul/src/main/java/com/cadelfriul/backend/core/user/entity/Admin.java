package com.cadelfriul.backend.core.auth.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdminRole role;

    // Relazione Uno-a-Molti: Un Admin ha molti log.
    // 'mappedBy' indica che la relazione è gestita dal campo 'admin' nella classe AdminLog.
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdminLog> logs = new ArrayList<>();

    // --- Costruttori ---
    public Admin() {}

    public Admin(String email, String password, String fullName, AdminRole role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
    }

    // --- Getter & Setter ---
    public UUID getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public AdminRole getRole() { return role; }
    public void setRole(AdminRole role) { this.role = role; }

    public List<AdminLog> getLogs() { return logs; }
    public void setLogs(List<AdminLog> logs) { this.logs = logs; }

    // Metodo helper per aggiungere un log facilmente e mantenere la sincronia tra le due entità
    public void addLog(AdminLog log) {
        logs.add(log);
        log.setAdmin(this);
    }
}