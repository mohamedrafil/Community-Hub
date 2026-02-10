package com.communityhub.service;

import com.communityhub.dto.AuthResponse;
import com.communityhub.dto.LoginRequest;
import com.communityhub.dto.RegisterRequest;
import com.communityhub.model.Invite;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.InviteRepository;
import com.communityhub.repository.UserRepository;
import com.communityhub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final InviteRepository inviteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final MembershipService membershipService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDepartment(request.getDepartment());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setIsActive(true);
        user.setEmailVerified(true);
        
        User savedUser = userRepository.save(user);
        
        // Handle invite token if present
        if (request.getInviteToken() != null && !request.getInviteToken().isEmpty()) {
            Invite invite = inviteRepository.findByInviteToken(request.getInviteToken())
                    .orElseThrow(() -> new RuntimeException("Invalid invite token"));
            
            if (invite.getIsUsed() || invite.getIsExpired()) {
                throw new RuntimeException("Invite token is no longer valid");
            }
            
            // Auto-add user to community
            Membership membership = new Membership();
            membership.setUser(savedUser);
            membership.setCommunity(invite.getCommunity());
            membership.setRole(invite.getRoleType());
            membership.setIsActive(true);
            membershipService.saveMembership(membership);
            
            // Mark invite as used
            invite.setIsUsed(true);
            invite.setUsedAt(LocalDateTime.now());
            inviteRepository.save(invite);
        }
        
        // Generate JWT token
        var userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getEmail())
                .password(savedUser.getPassword())
                .authorities("USER")
                .build();
        
        String token = jwtTokenProvider.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .username(savedUser.getEmail().split("@")[0])
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .profileImageUrl(savedUser.getProfileImageUrl())
                .message("Registration successful")
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        var userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("USER")
                .build();
        
        String token = jwtTokenProvider.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getEmail().split("@")[0])
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .message("Login successful")
                .build();
    }
    
    public AuthResponse getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getEmail().split("@")[0])
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .message("User retrieved successfully")
                .build();
    }
}
