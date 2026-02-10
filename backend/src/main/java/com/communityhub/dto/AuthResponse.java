package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    @Builder.Default
    private String type = "Bearer";
    private String token;
    private Long userId;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String profileImageUrl;
    private String message;
}
