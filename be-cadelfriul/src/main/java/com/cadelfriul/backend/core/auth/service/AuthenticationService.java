package com.cadelfriul.backend.core.auth.service;

import com.cadelfriul.backend.core.auth.dto.LoginRequest;
import com.cadelfriul.backend.core.auth.dto.LoginResponse;
import com.cadelfriul.backend.core.auth.entity.Admin;
import com.cadelfriul.backend.core.auth.entity.AdminLog;
import com.cadelfriul.backend.core.auth.entity.Customer;
import com.cadelfriul.backend.core.auth.entity.CustomerLog;
import com.cadelfriul.backend.core.auth.repository.AdminLogRepository;
import com.cadelfriul.backend.core.auth.repository.AdminRepository;
import com.cadelfriul.backend.core.auth.repository.CustomerLogRepository;
import com.cadelfriul.backend.core.auth.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class AuthenticationService {

    private final AdminRepository adminRepository;
    private final AdminLogRepository adminLogRepository;
    private final CustomerRepository customerRepository;
    private final CustomerLogRepository customerLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(AdminRepository adminRepository,
                                 AdminLogRepository adminLogRepository,
                                 CustomerRepository customerRepository,
                                 CustomerLogRepository customerLogRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.adminLogRepository = adminLogRepository;
        this.customerRepository = customerRepository;
        this.customerLogRepository = customerLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse loginAdmin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        Map<String, Object> claims = Map.of(
                "role", "ADMIN",
                "adminRole", admin.getRole().name()
        );

        String token = jwtService.generateToken(admin.getEmail(), claims);

        AdminLog log = new AdminLog(null, "LOGIN_SUCCESS", "Admin login successful");
        admin.addLog(log);
        adminLogRepository.save(log);

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationMs() / 1000,
                admin.getEmail(),
                admin.getFullName(),
                "ADMIN"
        );
    }

    public LoginResponse loginCustomer(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        Map<String, Object> claims = Map.of(
                "role", "CUSTOMER"
        );

        String token = jwtService.generateToken(customer.getEmail(), claims);

        CustomerLog log = new CustomerLog(null, "LOGIN_SUCCESS", "Customer login successful");
        customer.addLog(log);
        customerLogRepository.save(log);

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationMs() / 1000,
                customer.getEmail(),
                customer.getFirstName() + " " + customer.getLastName(),
                "CUSTOMER"
        );
    }
}
