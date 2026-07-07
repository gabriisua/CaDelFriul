package com.cadelfriul.backend.core.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Dati di Accesso
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Dati Anagrafici
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column
    private String phone;

    // Tracciamento
    @Column(nullable = false, updatable = false)
    private LocalDateTime registrationDate;

    // Relazione con la rubrica degli indirizzi
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    // Relazione con i log di tracciamento
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerLog> logs = new ArrayList<>();

    // --- Costruttori ---
    public Customer() {
        this.registrationDate = LocalDateTime.now();
    }

    public Customer(String email, String password, String firstName, String lastName, String phone) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.registrationDate = LocalDateTime.now();
    }

    // --- Getter & Setter Base ---
    public UUID getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }

    // --- Gestione Addresses ---
    public List<Address> getAddresses() { return addresses; }

    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }

    // Metodo helper per aggiungere un indirizzo in rubrica
    public void addAddress(Address address) {
        addresses.add(address);
        address.setCustomer(this);
    }

    // --- Gestione Logs ---
    public List<CustomerLog> getLogs() { return logs; }

    public void setLogs(List<CustomerLog> logs) { this.logs = logs; }

    // Metodo helper per aggiungere un log facilmente
    public void addLog(CustomerLog log) {
        logs.add(log);
        log.setCustomer(this);
    }
}