package com.cadelfriul.backend.ecommerce.dto;

import com.cadelfriul.backend.core.user.entity.Customer;
import java.util.UUID;

public class CustomerSummaryDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    public CustomerSummaryDTO(Customer customer) {
        this.id = customer.getId();
        this.firstName = customer.getFirstName();
        this.lastName = customer.getLastName();
        this.email = customer.getEmail();
        this.phone = customer.getPhone();
    }

    public UUID getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
}
