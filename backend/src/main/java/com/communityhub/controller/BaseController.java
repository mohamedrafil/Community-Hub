package com.communityhub.controller;

import com.communityhub.model.User;
import com.communityhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

public abstract class BaseController {
    
    @Autowired
    protected UserRepository userRepository;
    
    protected User getUserFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
