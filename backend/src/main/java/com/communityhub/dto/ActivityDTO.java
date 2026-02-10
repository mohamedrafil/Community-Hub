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
public class ActivityDTO {
    private Long id;
    private String activityType;
    private String description;
    private Long userId;
    private String userName;
    private LocalDateTime timestamp;
    private String metadata;
}
