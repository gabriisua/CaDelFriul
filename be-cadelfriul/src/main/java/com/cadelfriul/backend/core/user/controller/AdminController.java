package com.cadelfriul.backend.core.user.controller;

import com.cadelfriul.backend.core.user.dto.AdminCreateRequest;
import com.cadelfriul.backend.core.user.dto.AdminLogResponse;
import com.cadelfriul.backend.core.user.dto.AdminResponse;
import com.cadelfriul.backend.core.user.dto.AdminUpdateRequest;
import com.cadelfriul.backend.core.user.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<AdminResponse>> findAll() {
        return ResponseEntity.ok(adminService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AdminResponse> create(@RequestBody AdminCreateRequest request) {
        AdminResponse response = adminService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminResponse> update(@PathVariable UUID id, @RequestBody AdminUpdateRequest request) {
        return ResponseEntity.ok(adminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        adminService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<AdminLogResponse>> findLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.findLogsByAdminId(id));
    }
}
