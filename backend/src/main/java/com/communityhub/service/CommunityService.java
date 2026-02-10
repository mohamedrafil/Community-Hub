package com.communityhub.service;

import com.communityhub.model.Community;
import com.communityhub.repository.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommunityService {
    
    private final CommunityRepository communityRepository;
    
    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }
    
    @SuppressWarnings("null")
    public Optional<Community> getCommunityById(Long id) {
        return communityRepository.findById(id);
    }
    
    public Optional<Community> getCommunityByJoinCode(String joinCode) {
        return communityRepository.findByJoinCode(joinCode);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public Community createCommunity(Community community) {
        return communityRepository.save(community);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public Community updateCommunity(Long id, Community communityDetails) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        community.setName(communityDetails.getName());
        community.setDescription(communityDetails.getDescription());
        community.setIsPrivate(communityDetails.getIsPrivate());
        community.setLogoUrl(communityDetails.getLogoUrl());
        community.setAllowMemberToMemberDM(communityDetails.getAllowMemberToMemberDM());
        
        return communityRepository.save(community);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public void deleteCommunity(Long id) {
        // Verify community exists
        if (!communityRepository.existsById(id)) {
            throw new RuntimeException("Community not found");
        }
        
        // Delete related entities in correct order to avoid FK constraints
        communityRepository.deleteActivitiesByCommunityId(id);
        communityRepository.deleteDmMessagesByCommunityId(id);
        communityRepository.deleteInvitesByCommunityId(id);
        communityRepository.deleteJoinRequestsByCommunityId(id);
        communityRepository.deleteAnnouncementsByCommunityId(id);
        communityRepository.deleteGroupChatsByCommunityId(id);
        communityRepository.deleteChannelsByCommunityId(id);
        communityRepository.deleteMembershipsByCommunityId(id);
        
        // Finally delete the community itself
        communityRepository.deleteById(id);
        communityRepository.flush();
    }
}
