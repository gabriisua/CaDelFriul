package com.cadelfriul.backend.core.auth.controller;

import com.cadelfriul.backend.core.auth.dto.AuthMeResponse;
import com.cadelfriul.backend.core.auth.dto.CustomerCreateRequest;
import com.cadelfriul.backend.core.auth.dto.CustomerResponse;
import com.cadelfriul.backend.core.auth.dto.LoginRequest;
import com.cadelfriul.backend.core.auth.dto.LoginResponse;
import com.cadelfriul.backend.core.auth.dto.PasswordResetConfirm;
import com.cadelfriul.backend.core.auth.dto.PasswordResetRequest;
import com.cadelfriul.backend.core.auth.service.AuthenticationService;
import com.cadelfriul.backend.core.auth.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final CustomerService customerService;

    public AuthenticationController(AuthenticationService authenticationService,
                                    CustomerService customerService) {
        this.authenticationService = authenticationService;
        this.customerService = customerService;
    }

    @PostMapping("/admin/login")
    @Operation(summary = "Admin login", description = "Authenticate an admin user and return a JWT token")
    public ResponseEntity<LoginResponse> loginAdmin(@RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.loginAdmin(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/customer/login")
    @Operation(summary = "Customer login", description = "Authenticate a customer user and return a JWT token")
    public ResponseEntity<LoginResponse> loginCustomer(@RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.loginCustomer(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/customer/register")
    @Operation(summary = "Customer registration", description = "Register a new customer account")
    public ResponseEntity<CustomerResponse> registerCustomer(@RequestBody CustomerCreateRequest request) {
        CustomerResponse response = customerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's profile data")
    public ResponseEntity<AuthMeResponse> getCurrentUser() {
        AuthMeResponse response = authenticationService.getCurrentUser();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset/request")
    @Operation(summary = "Request password reset", description = "Sends a password reset link to the provided email")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        authenticationService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Confirm password reset", description = "Resets the password using a valid token")
    public ResponseEntity<Void> confirmPasswordReset(@RequestBody PasswordResetConfirm request) {
        authenticationService.confirmPasswordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
