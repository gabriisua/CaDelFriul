package com.cadelfriul.backend.core.user.dto;

import com.cadelfriul.backend.core.user.entity.Admin;
import com.cadelfriul.backend.core.user.entity.AdminRole;
import java.util.UUID;

public class AdminResponse {

    private final UUID id;
    private final String email;
    private final String fullName;
    private final AdminRole role;

    public AdminResponse(Admin admin) {
        this.id = admin.getId();
        this.email = admin.getEmail();
        this.fullName = admin.getFullName();
        this.role = admin.getRole();
    }

    public UUID getId() { return id; }

    public String getEmail() { return email; }

    public String getFullName() { return fullName; }

    public AdminRole getRole() { return role; }
}
