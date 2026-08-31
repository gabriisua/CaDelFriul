package com.cadelfriul.backend.ecommerce.dto;

import java.math.BigDecimal;

public class AdminDashboardResponse {
    private long totalOrders;
    private BigDecimal revenue;
    private long activeStaff;
    private long customers;

    public AdminDashboardResponse(long totalOrders, BigDecimal revenue, long activeStaff, long customers) {
        this.totalOrders = totalOrders;
        this.revenue = revenue;
        this.activeStaff = activeStaff;
        this.customers = customers;
    }

    // Aggiungi i soliti Getter e Setter
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public long getActiveStaff() { return activeStaff; }
    public void setActiveStaff(long activeStaff) { this.activeStaff = activeStaff; }
    public long getCustomers() { return customers; }
    public void setCustomers(long customers) { this.customers = customers; }
}