package com.communityhub.service;

import com.communityhub.dto.CommunityStatsDTO;
import com.communityhub.dto.GlobalStatsDTO;
import com.communityhub.model.Community;
import com.communityhub.model.JoinRequest;
import com.communityhub.model.Membership;
import com.communityhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final DMMessageRepository dmMessageRepository;
    private final ChannelRepository channelRepository;
    private final GroupChatRepository groupChatRepository;
    private final ChannelMessageRepository channelMessageRepository;
    private final GroupChatMessageRepository groupChatMessageRepository;
    
    public CommunityStatsDTO getCommunityStats(Long communityId) {
        List<Membership> memberships = membershipRepository.findByCommunityId(communityId);
        long pendingRequests = joinRequestRepository.findByCommunityIdAndStatus(
                communityId, 
                JoinRequest.RequestStatus.PENDING
        ).size();
        
        long administrators = memberships.stream()
                .filter(m -> m.getRole() == Membership.RoleType.ADMINISTRATOR)
                .count();
        
        long moderators = memberships.stream()
                .filter(m -> m.getRole() == Membership.RoleType.MODERATOR)
                .count();
        
        long activeMembers = memberships.stream()
                .filter(Membership::getIsActive)
                .count();
        
        // Count channels and group chats
        long channelCount = channelRepository.findAll().stream()
                .filter(c -> c.getCommunity().getId().equals(communityId))
                .count();
        
        long groupChatCount = groupChatRepository.findAll().stream()
                .filter(gc -> gc.getCommunity().getId().equals(communityId))
                .count();
        
        // Count messages from channels and group chats
        long channelMessages = channelMessageRepository.countByCommunityId(communityId);
        long groupChatMessages = groupChatMessageRepository.countByCommunityId(communityId);
        long totalMessages = channelMessages + groupChatMessages;
        
        // Count active users (logged in within last 24 hours)
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        long activeUsers = memberships.stream()
                .map(Membership::getUser)
                .filter(user -> user.getLastLoginAt() != null && user.getLastLoginAt().isAfter(yesterday))
                .distinct()
                .count();
        
        return CommunityStatsDTO.builder()
                .communityId(communityId)
                .totalMembers(activeMembers)
                .pendingRequests(pendingRequests)
                .activeChannels(channelCount)
                .groupChats(groupChatCount)
                .totalMessages(totalMessages)
                .activeUsers(activeUsers)
                .administratorCount(administrators)
                .moderatorCount(moderators)
                .build();
    }
    
    public GlobalStatsDTO getGlobalStats() {
        long totalCommunities = communityRepository.count();
        long totalUsers = userRepository.count();
        long totalMessages = dmMessageRepository.count();
        
        List<Community> communities = communityRepository.findAll();
        long publicCommunities = communities.stream()
                .filter(c -> !c.getIsPrivate())
                .count();
        long privateCommunities = communities.stream()
                .filter(Community::getIsPrivate)
                .count();
        
        // Count users active in last 24 hours
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        long activeNow = userRepository.findAll().stream()
                .filter(u -> u.getLastLoginAt() != null && u.getLastLoginAt().isAfter(yesterday))
                .count();
        
        return GlobalStatsDTO.builder()
                .totalCommunities(totalCommunities)
                .totalUsers(totalUsers)
                .totalMessages(totalMessages)
                .activeNow(activeNow)
                .publicCommunities(publicCommunities)
                .privateCommunities(privateCommunities)
                .build();
    }
}
