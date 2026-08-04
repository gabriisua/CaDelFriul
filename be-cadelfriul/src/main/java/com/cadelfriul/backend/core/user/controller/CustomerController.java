package com.cadelfriul.backend.core.user.controller;

import com.cadelfriul.backend.core.user.dto.CustomerDashboardResponse;
import com.cadelfriul.backend.core.user.dto.CustomerLogResponse;
import com.cadelfriul.backend.core.user.dto.CustomerResponse;
import com.cadelfriul.backend.core.user.dto.CustomerUpdateRequest;
import com.cadelfriul.backend.core.user.entity.Customer;
import com.cadelfriul.backend.core.user.repository.AddressRepository;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import com.cadelfriul.backend.core.user.service.CustomerService;
import com.cadelfriul.backend.ecommerce.entity.OrderStatus;
import com.cadelfriul.backend.ecommerce.repository.OrderRepository;
import com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTO;
import com.cadelfriul.backend.hospitality.entity.ReservationStatus;
import com.cadelfriul.backend.hospitality.entity.RoomReservation;
import com.cadelfriul.backend.hospitality.repository.RoomReservationRepository;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final RoomReservationRepository roomReservationRepository;

    public CustomerController(CustomerService customerService,
                              CustomerRepository customerRepository,
                              OrderRepository orderRepository,
                              AddressRepository addressRepository,
                              RoomReservationRepository roomReservationRepository) {
        this.customerService = customerService;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.roomReservationRepository = roomReservationRepository;
    }

    /**
     * @param customerId l'ID del cliente su cui operare
     * @param allowAdmin se true, permette l'accesso anche agli amministratori
     */
    private void validateOwnership(UUID customerId, boolean allowAdmin) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedEmail = authentication.getName();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with id: " + customerId));

        // 1. Se l'azione è consentita agli admin, controlliamo se l'utente è un admin (o super admin)
        if (allowAdmin) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().toUpperCase().contains("ADMIN"));
            if (isAdmin) {
                return; // È un admin/super admin e l'azione lo consente: passa!
            }
        }

        // 2. Se NON è un admin (oppure l'azione vieta l'uso agli admin, come l'Update), controlliamo che sia il proprietario
        if (!customer.getEmail().equals(authenticatedEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access Denied: You are not authorized to perform this action on this profile");
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<CustomerResponse>> findAll() {
        return ResponseEntity.ok(customerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> findById(@PathVariable UUID id) {
        // Lettura: Permessa al proprietario E agli Admin
        validateOwnership(id, true);
        return ResponseEntity.ok(customerService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable UUID id, @RequestBody CustomerUpdateRequest request) {
        // Modifica: Permessa SOLO al proprietario. Gli admin vengono bloccati (allowAdmin = false)
        validateOwnership(id, false);
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        // Eliminazione: Permessa al proprietario E agli Admin
        validateOwnership(id, true);
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<CustomerLogResponse>> findLogs(@PathVariable UUID id) {
        // Lettura Log: Permessa al proprietario E agli Admin
        validateOwnership(id, true);
        return ResponseEntity.ok(customerService.findLogsByCustomerId(id));
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<CustomerDashboardResponse> getMyDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Customer not found for email: " + email));
        Optional<RoomReservation> upcoming = roomReservationRepository
                .findFirstByUserIdAndStatusAndCheckInDateGreaterThanEqualOrderByCheckInDateAsc(
                        email, ReservationStatus.CONFIRMED, LocalDate.now());
        long activeOrdersCount = orderRepository.countByCustomerIdAndStatusNotIn(
                customer.getId(), List.of(OrderStatus.CANCELLED, OrderStatus.DELIVERED));
        long savedAddressesCount = addressRepository.countByCustomerId(customer.getId());
        return ResponseEntity.ok(new CustomerDashboardResponse(
                upcoming.map(RoomReservationResponseDTO::new).orElse(null),
                activeOrdersCount, savedAddressesCount));
    }
}