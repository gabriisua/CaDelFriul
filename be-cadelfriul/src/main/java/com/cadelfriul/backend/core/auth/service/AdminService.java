package com.cadelfriul.backend.core.auth.service;

import com.cadelfriul.backend.core.auth.dto.AdminCreateRequest;
import com.cadelfriul.backend.core.auth.dto.AdminLogResponse;
import com.cadelfriul.backend.core.auth.dto.AdminResponse;
import com.cadelfriul.backend.core.auth.dto.AdminUpdateRequest;
import com.cadelfriul.backend.core.auth.entity.Admin;
import com.cadelfriul.backend.core.auth.entity.AdminLog;
import com.cadelfriul.backend.core.auth.repository.AdminLogRepository;
import com.cadelfriul.backend.core.auth.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final AdminLogRepository adminLogRepository;
    private final PasswordEncoder passwordEncoder; // 1. Aggiunto l'encoder

    // 2. Iniettato tramite il costruttore
    public AdminService(AdminRepository adminRepository,
                        AdminLogRepository adminLogRepository,
                        PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.adminLogRepository = adminLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminResponse> findAll() {
        return adminRepository.findAll()
                .stream()
                .map(AdminResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminResponse findById(UUID id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        return new AdminResponse(admin);
    }

    public AdminResponse create(AdminCreateRequest request) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Admin with email " + request.getEmail() + " already exists");
        }

        Admin admin = new Admin(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()), // 3. Hashing della password in creazione
                request.getFullName(),
                request.getRole()
        );

        AdminLog log = new AdminLog(null, "CREATED", "Admin account created with role: " + request.getRole());
        admin.addLog(log);

        admin = adminRepository.save(admin);
        return new AdminResponse(admin);
    }

    public AdminResponse update(UUID id, AdminUpdateRequest request) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        StringBuilder details = new StringBuilder();

        if (request.getEmail() != null && !request.getEmail().equals(admin.getEmail())) {
            if (adminRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email " + request.getEmail() + " is already in use");
            }
            details.append("Email changed from '").append(admin.getEmail())
                    .append("' to '").append(request.getEmail()).append("'; ");
            admin.setEmail(request.getEmail());
        }

        if (request.getFullName() != null && !request.getFullName().equals(admin.getFullName())) {
            details.append("Name changed from '").append(admin.getFullName())
                    .append("' to '").append(request.getFullName()).append("'; ");
            admin.setFullName(request.getFullName());
        }

        if (request.getRole() != null && !request.getRole().equals(admin.getRole())) {
            details.append("Role changed from '").append(admin.getRole())
                    .append("' to '").append(request.getRole()).append("'; ");
            admin.setRole(request.getRole());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            details.append("Password changed; ");
            admin.setPassword(passwordEncoder.encode(request.getPassword())); // 4. Hashing della nuova password in aggiornamento
        }

        if (!details.isEmpty()) {
            AdminLog log = new AdminLog(null, "UPDATED", details.toString());
            admin.addLog(log);
        }

        admin = adminRepository.save(admin);
        return new AdminResponse(admin);
    }

    public void delete(UUID id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        adminRepository.delete(admin);
    }

    @Transactional(readOnly = true)
    public List<AdminLogResponse> findLogsByAdminId(UUID id) {
        if (!adminRepository.existsById(id)) {
            throw new RuntimeException("Admin not found with id: " + id);
        }
        return adminLogRepository.findAllByAdminIdOrderByTimestampDesc(id)
                .stream()
                .map(AdminLogResponse::new)
                .toList();
    }
}