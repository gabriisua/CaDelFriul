package com.cadelfriul.backend.core.auth.dto;

import com.cadelfriul.backend.core.auth.entity.CustomerLog;
import java.time.LocalDateTime;
import java.util.UUID;

public class CustomerLogResponse {

    private final UUID id;
    private final String action;
    private final String details;
    private final LocalDateTime timestamp;

    public CustomerLogResponse(CustomerLog log) {
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
