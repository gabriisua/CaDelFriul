package com.cadelfriul.backend.core.user.dto;

import com.cadelfriul.backend.core.user.entity.AdminLog;
import java.time.LocalDateTime;
import java.util.UUID;

public class AdminLogResponse {

    private final UUID id;
    private final String action;
    private final String details;
    private final LocalDateTime timestamp;

    public AdminLogResponse(AdminLog log) {
        this.id = log.getId();
        this.action = log.getAction();
        this.details = log.getDetails();
        this.timestamp = log.getTimestamp();
    }

    public UUID getId() { return id; }

    public String getAction() { return action; }

    public String getDetails() { return details; }

    public LocalDateTime getTimestamp() { return timestamp; }
}
