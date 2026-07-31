package com.cadelfriul.backend.core.user.dto;

public class LoginResponse {

    private final String token;
    private final String type;
    private final long expiresIn;
    private final String email;
    private final String name;
    private final String role;

    public LoginResponse(String token, String type, long expiresIn, String email, String name, String role) {
        this.token = token;
        this.type = type;
        this.expiresIn = expiresIn;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public String getToken() { return token; }

    public String getType() { return type; }

    public long getExpiresIn() { return expiresIn; }

    public String getEmail() { return email; }

    public String getName() { return name; }

    public String getRole() { return role; }
}
