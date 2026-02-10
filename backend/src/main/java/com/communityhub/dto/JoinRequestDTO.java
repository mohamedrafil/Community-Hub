package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestDTO {
    private Long id;
    private UserDTO user;
    private String message;
    private String status;
    private LocalDateTime requestedAt;
    private UserDTO reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewNote;
}
