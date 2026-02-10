package com.communityhub.service;

import com.communityhub.dto.ActivityDTO;
import com.communityhub.dto.MemberDetailsDTO;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.MembershipRepository;
import com.communityhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberManagementService {
    
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    
    public List<MemberDetailsDTO> getCommunityMembers(Long communityId) {
        return membershipRepository.findByCommunityId(communityId).stream()
                .map(this::convertToDetailsDTO)
                .collect(Collectors.toList());
    }
    
    @SuppressWarnings("null")
    public MemberDetailsDTO getMemberDetails(Long communityId, Long memberId) {
        Membership membership = membershipRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Member does not belong to this community");
        }
        
        return convertToDetailsDTO(membership);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public MemberDetailsDTO addMember(Long communityId, Long userId, Membership.RoleType role) {
        // Check if already a member
        if (membershipRepository.existsByUserIdAndCommunityId(userId, communityId)) {
            throw new RuntimeException("User is already a member of this community");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setCommunity(new com.communityhub.model.Community());
        membership.getCommunity().setId(communityId);
        membership.setRole(role);
        membership.setIsActive(true);
        
        Membership saved = membershipRepository.save(membership);
        
        // Log activity
        activityService.logActivity(
                userId,
                communityId,
                "MEMBER_ADDED",
                "Added as " + role.name(),
                null
        );
        
        return convertToDetailsDTO(saved);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public MemberDetailsDTO changeMemberRole(Long communityId, Long memberId, Membership.RoleType newRole) {
        Membership membership = membershipRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Member does not belong to this community");
        }
        
        Membership.RoleType oldRole = membership.getRole();
        membership.setRole(newRole);
        Membership updated = membershipRepository.save(membership);
        
        // Log activity
        activityService.logActivity(
                membership.getUser().getId(),
                communityId,
                "ROLE_CHANGED",
                "Role changed from " + oldRole.name() + " to " + newRole.name(),
                null
        );
        
        return convertToDetailsDTO(updated);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public void removeMember(Long communityId, Long memberId) {
        Membership membership = membershipRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Member does not belong to this community");
        }
        
        // Log activity before deletion
        activityService.logActivity(
                membership.getUser().getId(),
                communityId,
                "MEMBER_REMOVED",
                "Removed from community",
                null
        );
        
        membershipRepository.deleteById(memberId);
    }
    
    @SuppressWarnings("null")
    public List<ActivityDTO> getMemberActivity(Long memberId) {
        Membership membership = membershipRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        return activityService.getUserActivities(
                membership.getUser().getId(),
                membership.getCommunity().getId(),
                50
        );
    }
    
    private MemberDetailsDTO convertToDetailsDTO(Membership membership) {
        User user = membership.getUser();
        return MemberDetailsDTO.builder()
                .id(membership.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(membership.getRole().name())
                .department(user.getDepartment())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(membership.getIsActive())
                .joinedAt(membership.getJoinedAt())
                .lastActive(user.getLastLoginAt())
                .recentActivity(new ArrayList<>())
                .build();
    }
}
