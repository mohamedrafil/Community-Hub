package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalStatsDTO {
    private long totalCommunities;
    private long totalUsers;
    private long totalMessages;
    private long activeNow;
    private long publicCommunities;
    private long privateCommunities;
}
