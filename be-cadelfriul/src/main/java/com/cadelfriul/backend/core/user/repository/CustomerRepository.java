package com.cadelfriul.backend.core.user.repository;

import com.cadelfriul.backend.core.user.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    boolean existsByEmail(String email);

    java.util.Optional<Customer> findByEmail(String email);
}
