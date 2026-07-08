package com.cadelfriul.backend.core.auth.repository;

import com.cadelfriul.backend.core.auth.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByCustomerId(UUID customerId);

    Optional<Address> findByIdAndCustomerId(UUID id, UUID customerId);

    long countByCustomerId(UUID customerId);
}
