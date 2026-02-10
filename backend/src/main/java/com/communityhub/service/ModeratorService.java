package com.communityhub.service;

import com.communityhub.dto.ActivityDTO;
import com.communityhub.dto.ModeratorDetailsDTO;
import com.communityhub.dto.ModeratorPermissionDTO;
import com.communityhub.model.Membership;
import com.communityhub.model.ModeratorPermission;
import com.communityhub.repository.MembershipRepository;
import com.communityhub.repository.ModeratorPermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModeratorService {
    
    private final MembershipRepository membershipRepository;
    private final ModeratorPermissionRepository moderatorPermissionRepository;
    private final ActivityService activityService;
    
    public List<ModeratorDetailsDTO> getCommunityModerators(Long communityId) {
        List<Membership> moderators = membershipRepository.findByCommunityId(communityId).stream()
                .filter(m -> m.getRole() == Membership.RoleType.MODERATOR)
                .collect(Collectors.toList());
        
        return moderators.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @SuppressWarnings("null")
    public ModeratorDetailsDTO getModeratorDetails(Long communityId, Long moderatorId) {
        Membership membership = membershipRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        if (!membership.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Moderator does not belong to this community");
        }
        
        if (membership.getRole() != Membership.RoleType.MODERATOR) {
            throw new RuntimeException("Member is not a moderator");
        }
        
        return convertToDTO(membership);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public ModeratorDetailsDTO updatePermissions(Long moderatorId, ModeratorPermission permissions) {
        Membership membership = membershipRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        if (membership.getRole() != Membership.RoleType.MODERATOR) {
            throw new RuntimeException("Member is not a moderator");
        }
        
        ModeratorPermission existingPermissions = membership.getModeratorPermission();
        
        if (existingPermissions == null) {
            existingPermissions = new ModeratorPermission();
            membership.setModeratorPermission(existingPermissions);
        }
        
        // Update permissions
        existingPermissions.setCanApproveJoinRequests(permissions.getCanApproveJoinRequests());
        existingPermissions.setCanAddMembers(permissions.getCanAddMembers());
        existingPermissions.setCanRemoveMembers(permissions.getCanRemoveMembers());
        existingPermissions.setCanManageChannels(permissions.getCanManageChannels());
        existingPermissions.setCanDeleteMessages(permissions.getCanDeleteMessages());
        existingPermissions.setCanCreateAnnouncements(permissions.getCanCreateAnnouncements());
        existingPermissions.setCanManageGroupChats(permissions.getCanManageGroupChats());
        existingPermissions.setCanViewAuditLogs(permissions.getCanViewAuditLogs());
        
        moderatorPermissionRepository.save(existingPermissions);
        membershipRepository.save(membership);
        
        // Log activity
        activityService.logActivity(
                membership.getUser().getId(),
                membership.getCommunity().getId(),
                "PERMISSIONS_UPDATED",
                "Moderator permissions updated",
                null
        );
        
        return convertToDTO(membership);
    }
    
    @SuppressWarnings("null")
    public List<ActivityDTO> getModeratorActions(Long moderatorId, int limit) {
        Membership membership = membershipRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found"));
        
        return activityService.getUserActivities(
                membership.getUser().getId(),
                membership.getCommunity().getId(),
                limit
        );
    }
    
    private ModeratorDetailsDTO convertToDTO(Membership membership) {
        ModeratorDetailsDTO dto = new ModeratorDetailsDTO();
        dto.setId(membership.getId());
        dto.setUserId(membership.getUser().getId());
        dto.setFullName(membership.getUser().getFullName());
        dto.setEmail(membership.getUser().getEmail());
        dto.setDepartment(membership.getUser().getDepartment());
        dto.setAssignedAt(membership.getJoinedAt());
        
        ModeratorPermission permissions = membership.getModeratorPermission();
        if (permissions != null) {
            ModeratorPermissionDTO permDTO = new ModeratorPermissionDTO();
            permDTO.setId(permissions.getId());
            permDTO.setCanApproveJoinRequests(permissions.getCanApproveJoinRequests());
            permDTO.setCanAddMembers(permissions.getCanAddMembers());
            permDTO.setCanRemoveMembers(permissions.getCanRemoveMembers());
            permDTO.setCanManageChannels(permissions.getCanManageChannels());
            permDTO.setCanDeleteMessages(permissions.getCanDeleteMessages());
            permDTO.setCanCreateAnnouncements(permissions.getCanCreateAnnouncements());
            permDTO.setCanManageGroupChats(permissions.getCanManageGroupChats());
            permDTO.setCanViewAuditLogs(permissions.getCanViewAuditLogs());
            dto.setPermissions(permDTO);
        } else {
            // Set default permissions (all false)
            ModeratorPermissionDTO permDTO = new ModeratorPermissionDTO();
            permDTO.setCanApproveJoinRequests(false);
            permDTO.setCanAddMembers(false);
            permDTO.setCanRemoveMembers(false);
            permDTO.setCanManageChannels(false);
            permDTO.setCanDeleteMessages(false);
            permDTO.setCanCreateAnnouncements(false);
            permDTO.setCanManageGroupChats(false);
            permDTO.setCanViewAuditLogs(false);
            dto.setPermissions(permDTO);
        }
        
        return dto;
    }
}
