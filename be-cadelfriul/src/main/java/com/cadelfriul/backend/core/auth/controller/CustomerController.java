package com.cadelfriul.backend.core.auth.controller;

import com.cadelfriul.backend.core.auth.dto.CustomerCreateRequest;
import com.cadelfriul.backend.core.auth.dto.CustomerLogResponse;
import com.cadelfriul.backend.core.auth.dto.CustomerResponse;
import com.cadelfriul.backend.core.auth.dto.CustomerUpdateRequest;
import com.cadelfriul.backend.core.auth.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> findAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@RequestBody CustomerCreateRequest request) {
        CustomerResponse response = customerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable UUID id, @RequestBody CustomerUpdateRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<CustomerLogResponse>> findLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.findLogsByCustomerId(id));
    }
}
