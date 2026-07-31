package com.cadelfriul.backend.ecommerce.controller;

import com.cadelfriul.backend.core.user.entity.Customer;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import com.cadelfriul.backend.ecommerce.dto.OrderRequest;
import com.cadelfriul.backend.ecommerce.dto.OrderResponse;
import com.cadelfriul.backend.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Customer Orders", description = "Customer endpoints for placing and viewing orders")
public class CustomerOrderController {

    private final OrderService orderService;
    private final CustomerRepository customerRepository;

    public CustomerOrderController(OrderService orderService, CustomerRepository customerRepository) {
        this.orderService = orderService;
        this.customerRepository = customerRepository;
    }

    private UUID getAuthenticatedCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
        return customer.getId();
    }

    @PostMapping
    @Operation(summary = "Create order", description = "Place a new order")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        UUID customerId = getAuthenticatedCustomerId();
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(customerId, request));
    }

    @GetMapping
    @Operation(summary = "List my orders", description = "Get order history for the authenticated customer")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        UUID customerId = getAuthenticatedCustomerId();
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get customer orders", description = "Get orders for a specific customer (admin only)")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(@PathVariable UUID customerId) {
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId));
    }
}
