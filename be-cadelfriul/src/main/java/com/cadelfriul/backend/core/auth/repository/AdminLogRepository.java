package com.cadelfriul.backend.core.auth.repository;

import com.cadelfriul.backend.core.auth.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AdminLogRepository extends JpaRepository<AdminLog, UUID> {
    List<AdminLog> findAllByAdminIdOrderByTimestampDesc(UUID adminId);
}
