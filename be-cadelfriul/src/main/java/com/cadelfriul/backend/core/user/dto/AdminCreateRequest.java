package com.cadelfriul.backend.core.user.dto;

import com.cadelfriul.backend.core.user.entity.AdminRole;

public class AdminCreateRequest {

    private String email;
    private String password;
    private String fullName;
    private AdminRole role;

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }

    public void setFullName(String fullName) { this.fullName = fullName; }

    public AdminRole getRole() { return role; }

    public void setRole(AdminRole role) { this.role = role; }
}
