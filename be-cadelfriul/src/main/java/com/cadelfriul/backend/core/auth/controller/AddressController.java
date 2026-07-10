package com.cadelfriul.backend.core.auth.controller;

import com.cadelfriul.backend.core.auth.dto.AddressRequest;
import com.cadelfriul.backend.core.auth.dto.AddressResponse;
import com.cadelfriul.backend.core.auth.entity.Customer;
import com.cadelfriul.backend.core.auth.repository.CustomerRepository;
import com.cadelfriul.backend.core.auth.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/{customerId}/addresses")
@Tag(name = "Customer Addresses", description = "Endpoints for managing a customer's address book")
public class AddressController {

    private final AddressService addressService;
    private final CustomerRepository customerRepository;

    public AddressController(AddressService addressService,
                             CustomerRepository customerRepository) {
        this.addressService = addressService;
        this.customerRepository = customerRepository;
    }

    private void validateOwnership(UUID customerId) {
        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        if (!customer.getEmail().equals(authenticatedEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access Denied: You cannot manage resources belonging to another user");
        }
    }

    @PostMapping
    @Operation(summary = "Add address", description = "Add a new address to the customer's address book")
    public ResponseEntity<AddressResponse> addAddress(@PathVariable UUID customerId,
                                                       @RequestBody AddressRequest request) {
        validateOwnership(customerId);
        AddressResponse response = addressService.addAddress(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List addresses", description = "Get all addresses for the customer")
    public ResponseEntity<List<AddressResponse>> getAddresses(@PathVariable UUID customerId) {
        validateOwnership(customerId);
        return ResponseEntity.ok(addressService.getAddressesByCustomerId(customerId));
    }

    @PutMapping("/{addressId}")
    @Operation(summary = "Update address", description = "Update an existing address")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable UUID customerId,
                                                          @PathVariable UUID addressId,
                                                          @RequestBody AddressRequest request) {
        validateOwnership(customerId);
        AddressResponse response = addressService.updateAddress(customerId, addressId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{addressId}")
    @Operation(summary = "Delete address", description = "Delete an address from the customer's address book")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID customerId,
                                               @PathVariable UUID addressId) {
        validateOwnership(customerId);
        addressService.deleteAddress(customerId, addressId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{addressId}/default-shipping")
    @Operation(summary = "Set default shipping", description = "Set this address as the default shipping address")
    public ResponseEntity<AddressResponse> setDefaultShipping(@PathVariable UUID customerId,
                                                               @PathVariable UUID addressId) {
        validateOwnership(customerId);
        AddressResponse response = addressService.setDefaultShipping(customerId, addressId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{addressId}/default-billing")
    @Operation(summary = "Set default billing", description = "Set this address as the default billing address")
    public ResponseEntity<AddressResponse> setDefaultBilling(@PathVariable UUID customerId,
                                                              @PathVariable UUID addressId) {
        validateOwnership(customerId);
        AddressResponse response = addressService.setDefaultBilling(customerId, addressId);
        return ResponseEntity.ok(response);
    }
}
