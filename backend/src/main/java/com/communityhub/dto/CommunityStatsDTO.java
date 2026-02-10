package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityStatsDTO {
    private Long communityId;
    private long totalMembers;
    private long pendingRequests;
    private long activeChannels;
    private long groupChats;
    private long totalMessages;
    private long activeUsers;
    private long administratorCount;
    private long moderatorCount;
}
