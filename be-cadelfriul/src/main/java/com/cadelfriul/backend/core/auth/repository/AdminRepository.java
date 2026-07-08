package com.cadelfriul.backend.core.auth.repository;

import com.cadelfriul.backend.core.auth.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    boolean existsByEmail(String email);

    java.util.Optional<Admin> findByEmail(String email);
}
