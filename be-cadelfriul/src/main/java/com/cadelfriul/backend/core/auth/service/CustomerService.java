package com.cadelfriul.backend.core.auth.service;

import com.cadelfriul.backend.core.auth.dto.CustomerCreateRequest;
import com.cadelfriul.backend.core.auth.dto.CustomerLogResponse;
import com.cadelfriul.backend.core.auth.dto.CustomerResponse;
import com.cadelfriul.backend.core.auth.dto.CustomerUpdateRequest;
import com.cadelfriul.backend.core.auth.entity.Customer;
import com.cadelfriul.backend.core.auth.entity.CustomerLog;
import com.cadelfriul.backend.core.auth.repository.CustomerLogRepository;
import com.cadelfriul.backend.core.auth.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerLogRepository customerLogRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository,
                           CustomerLogRepository customerLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.customerLogRepository = customerLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return new CustomerResponse(customer);
    }

    public CustomerResponse create(CustomerCreateRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email " + request.getEmail() + " is already in use");
        }

        Customer customer = new Customer(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone()
        );

        CustomerLog log = new CustomerLog(null, "CREATED", "Customer account created");
        customer.addLog(log);

        customer = customerRepository.save(customer);
        return new CustomerResponse(customer);
    }

    public CustomerResponse update(UUID id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        StringBuilder details = new StringBuilder();

        if (request.getEmail() != null && !request.getEmail().equals(customer.getEmail())) {
            if (customerRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email " + request.getEmail() + " is already in use");
            }
            details.append("Email changed from '").append(customer.getEmail())
                    .append("' to '").append(request.getEmail()).append("'; ");
            customer.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null && !request.getFirstName().equals(customer.getFirstName())) {
            details.append("First name changed from '").append(customer.getFirstName())
                    .append("' to '").append(request.getFirstName()).append("'; ");
            customer.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null && !request.getLastName().equals(customer.getLastName())) {
            details.append("Last name changed from '").append(customer.getLastName())
                    .append("' to '").append(request.getLastName()).append("'; ");
            customer.setLastName(request.getLastName());
        }

        if (request.getPhone() != null && !request.getPhone().equals(customer.getPhone())) {
            details.append("Phone changed from '").append(customer.getPhone())
                    .append("' to '").append(request.getPhone()).append("'; ");
            customer.setPhone(request.getPhone());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            details.append("Password changed; ");
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (!details.isEmpty()) {
            CustomerLog log = new CustomerLog(null, "UPDATED", details.toString());
            customer.addLog(log);
        }

        customer = customerRepository.save(customer);
        return new CustomerResponse(customer);
    }

    public void delete(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        customerRepository.delete(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerLogResponse> findLogsByCustomerId(UUID id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with id: " + id);
        }
        return customerLogRepository.findAllByCustomerIdOrderByTimestampDesc(id)
                .stream()
                .map(CustomerLogResponse::new)
                .toList();
    }
}