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
public class ModeratorDetailsDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String department;
    private LocalDateTime assignedAt;
    private UserDTO assignedBy;
    private ModeratorPermissionDTO permissions;
    private long totalActions;
}
