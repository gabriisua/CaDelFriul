package com.cadelfriul.backend.core.user.dto;

import java.util.UUID;

public class AuthMeResponse {

    private final UUID id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String role;

    public AuthMeResponse(UUID id, String email, String firstName, String lastName, String role) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getRole() { return role; }
}
