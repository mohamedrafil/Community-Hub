package com.communityhub.service;

import com.communityhub.model.Community;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MembershipService {
    
    private final MembershipRepository membershipRepository;
    
    public List<Membership> getUserMemberships(Long userId) {
        return membershipRepository.findByUserId(userId);
    }
    
    public List<Membership> getCommunityMembers(Long communityId) {
        return membershipRepository.findByCommunityId(communityId);
    }
    
    public Optional<Membership> getMembership(Long userId, Long communityId) {
        return membershipRepository.findByUserIdAndCommunityId(userId, communityId);
    }
    
    public boolean isMember(Long userId, Long communityId) {
        return membershipRepository.existsByUserIdAndCommunityId(userId, communityId);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public Membership saveMembership(Membership membership) {
        return membershipRepository.save(membership);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public void deleteMembership(Long membershipId) {
        membershipRepository.deleteById(membershipId);
    }
    
    public boolean isAdministrator(Long userId, Long communityId) {
        return membershipRepository.findByUserIdAndCommunityId(userId, communityId)
                .map(m -> m.getRole() == Membership.RoleType.ADMINISTRATOR)
                .orElse(false);
    }
    
    public boolean isModerator(Long userId, Long communityId) {
        return membershipRepository.findByUserIdAndCommunityId(userId, communityId)
                .map(m -> m.getRole() == Membership.RoleType.MODERATOR)
                .orElse(false);
    }
    
    public boolean isAdminOrModerator(Long userId, Long communityId) {
        return membershipRepository.findByUserIdAndCommunityId(userId, communityId)
                .map(m -> m.getRole() == Membership.RoleType.ADMINISTRATOR || 
                          m.getRole() == Membership.RoleType.MODERATOR)
                .orElse(false);
    }
    
    public long getCommunityMemberCount(Long communityId) {
        return membershipRepository.findByCommunityId(communityId).stream()
                .filter(m -> m.getIsActive())
                .count();
    }
    
    @Transactional
    public Membership createMembership(User user, Community community, Membership.RoleType roleType) {
        // Check if membership already exists
        Optional<Membership> existingMembership = membershipRepository.findByUserIdAndCommunityId(user.getId(), community.getId());
        if (existingMembership.isPresent()) {
            throw new RuntimeException("User is already a member of this community");
        }
        
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setCommunity(community);
        membership.setRole(roleType);
        membership.setIsActive(true);
        
        return membershipRepository.save(membership);
    }
}
