package com.cadelfriul.backend.core.user.controller;

import com.cadelfriul.backend.ecommerce.dto.AdminDashboardResponse;
import com.cadelfriul.backend.core.user.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController; // <-- QUESTO È FONDAMENTALE

@RestController // Deve essere @RestController, NON @Controller
@RequestMapping("/api/admin") // Controlla che questo path sia presente
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('ROLE_ADMIN')") // Usa l'autorità esatta vista nei log
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}