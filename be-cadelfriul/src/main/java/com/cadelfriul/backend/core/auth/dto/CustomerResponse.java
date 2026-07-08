package com.cadelfriul.backend.core.auth.dto;

import com.cadelfriul.backend.core.auth.entity.Customer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CustomerResponse {

    private final UUID id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final LocalDateTime registrationDate;
    private final List<AddressResponse> addresses; // Aggiunta rubrica

    public CustomerResponse(Customer customer) {
        this.id = customer.getId();
        this.email = customer.getEmail();
        this.firstName = customer.getFirstName();
        this.lastName = customer.getLastName();
        this.phone = customer.getPhone();
        this.registrationDate = customer.getRegistrationDate();

        // Mappiamo le entità Address nel DTO sicuro
        this.addresses = customer.getAddresses()
                .stream()
                .map(AddressResponse::new)
                .toList();
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public List<AddressResponse> getAddresses() { return addresses; }
}