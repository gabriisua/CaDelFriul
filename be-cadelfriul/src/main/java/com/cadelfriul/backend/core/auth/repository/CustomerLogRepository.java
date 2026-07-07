package com.cadelfriul.backend.core.auth.repository;

import com.cadelfriul.backend.core.auth.entity.CustomerLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CustomerLogRepository extends JpaRepository<CustomerLog, UUID> {
    List<CustomerLog> findAllByCustomerIdOrderByTimestampDesc(UUID customerId);
}
