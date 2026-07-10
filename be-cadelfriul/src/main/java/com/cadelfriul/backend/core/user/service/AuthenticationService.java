package com.cadelfriul.backend.core.user.service;

import com.cadelfriul.backend.core.user.dto.AuthMeResponse;
import com.cadelfriul.backend.core.user.dto.LoginRequest;
import com.cadelfriul.backend.core.user.dto.LoginResponse;
import com.cadelfriul.backend.core.user.entity.Admin;
import com.cadelfriul.backend.core.user.entity.AdminLog;
import com.cadelfriul.backend.core.user.entity.Customer;
import com.cadelfriul.backend.core.user.entity.CustomerLog;
import com.cadelfriul.backend.core.user.entity.PasswordResetToken;
import com.cadelfriul.backend.core.user.repository.AdminLogRepository;
import com.cadelfriul.backend.core.user.repository.AdminRepository;
import com.cadelfriul.backend.core.user.repository.CustomerLogRepository;
import com.cadelfriul.backend.core.user.repository.CustomerRepository;
import com.cadelfriul.backend.core.user.repository.PasswordResetTokenRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class AuthenticationService {

    private final AdminRepository adminRepository;
    private final AdminLogRepository adminLogRepository;
    private final CustomerRepository customerRepository;
    private final CustomerLogRepository customerLogRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(AdminRepository adminRepository,
                                 AdminLogRepository adminLogRepository,
                                 CustomerRepository customerRepository,
                                 CustomerLogRepository customerLogRepository,
                                 PasswordResetTokenRepository passwordResetTokenRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.adminLogRepository = adminLogRepository;
        this.customerRepository = customerRepository;
        this.customerLogRepository = customerLogRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
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

    public AuthMeResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        var customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            return new AuthMeResponse(customer.getId(), customer.getEmail(),
                    customer.getFirstName(), customer.getLastName(), "CUSTOMER");
        }

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new AuthMeResponse(admin.getId(), admin.getEmail(),
                admin.getFullName(), "", admin.getRole().name());
    }

    public void requestPasswordReset(String email) {
        boolean customerExists = customerRepository.existsByEmail(email);
        boolean adminExists = adminRepository.existsByEmail(email);

        if (!customerExists && !adminExists) {
            throw new RuntimeException("Email not found");
        }

        passwordResetTokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = new PasswordResetToken(token, email, expiry);
        passwordResetTokenRepository.save(resetToken);

        System.out.println("SENDING EMAIL TO: " + email
                + " WITH RESET LINK: http://localhost:3000/reset-password?token=" + token);
    }

    @Transactional
    public void confirmPasswordReset(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token expired");
        }

        String email = resetToken.getEmail();
        String hashedPassword = passwordEncoder.encode(newPassword);

        var customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setPassword(hashedPassword);
            customerRepository.save(customer);
        } else {
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            admin.setPassword(hashedPassword);
            adminRepository.save(admin);
        }

        passwordResetTokenRepository.delete(resetToken);
    }
}
