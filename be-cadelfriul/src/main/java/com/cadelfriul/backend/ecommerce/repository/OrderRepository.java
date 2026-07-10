package com.cadelfriul.backend.ecommerce.repository;

import com.cadelfriul.backend.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerId(UUID customerId);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
