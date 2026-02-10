package com.communityhub.controller;

import com.communityhub.dto.AuthResponse;
import com.communityhub.dto.LoginRequest;
import com.communityhub.dto.RegisterRequest;
import com.communityhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .message("Registration failed: " + e.getMessage())
                    .build()
            );
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .message("Login failed: " + e.getMessage())
                    .build()
            );
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        try {
            AuthResponse response = authService.getCurrentUser(authentication);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .message("Failed to get user: " + e.getMessage())
                    .build()
            );
        }
    }
}
