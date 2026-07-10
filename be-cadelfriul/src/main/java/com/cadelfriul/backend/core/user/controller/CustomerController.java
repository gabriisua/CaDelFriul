package com.cadelfriul.backend.core.user.controller;

import com.cadelfriul.backend.core.user.dto.CustomerLogResponse;
import com.cadelfriul.backend.core.user.dto.CustomerResponse;
import com.cadelfriul.backend.core.user.dto.CustomerUpdateRequest;
import com.cadelfriul.backend.core.user.entity.Customer;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import com.cadelfriul.backend.core.user.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepository;

    public CustomerController(CustomerService customerService,
                              CustomerRepository customerRepository) {
        this.customerService = customerService;
        this.customerRepository = customerRepository;
    }

    private void validateOwnership(UUID customerId) {
        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        if (!customer.getEmail().equals(authenticatedEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access Denied: You cannot modify another user's profile");
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerResponse>> findAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> findById(@PathVariable UUID id) {
        validateOwnership(id);
        return ResponseEntity.ok(customerService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable UUID id, @RequestBody CustomerUpdateRequest request) {
        validateOwnership(id);
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        validateOwnership(id);
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<CustomerLogResponse>> findLogs(@PathVariable UUID id) {
        validateOwnership(id);
        return ResponseEntity.ok(customerService.findLogsByCustomerId(id));
    }
}
