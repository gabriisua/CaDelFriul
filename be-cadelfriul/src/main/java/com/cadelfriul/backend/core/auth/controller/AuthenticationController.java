package com.cadelfriul.backend.core.auth.controller;

import com.cadelfriul.backend.core.auth.dto.LoginRequest;
import com.cadelfriul.backend.core.auth.dto.LoginResponse;
import com.cadelfriul.backend.core.auth.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
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
}
