package com.communityhub.controller;

import com.communityhub.dto.ActivityDTO;
import com.communityhub.dto.ModeratorDetailsDTO;
import com.communityhub.model.ModeratorPermission;
import com.communityhub.model.User;
import com.communityhub.repository.UserRepository;
import com.communityhub.service.MembershipService;
import com.communityhub.service.ModeratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities/{communityId}/moderators")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ModeratorController {
    
    private final ModeratorService moderatorService;
    private final MembershipService membershipService;
    private final UserRepository userRepository;
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class UpdatePermissionsRequest {
        private Boolean canApproveJoinRequests;
        private Boolean canAddMembers;
        private Boolean canRemoveMembers;
        private Boolean canManageChannels;
        private Boolean canDeleteMessages;
        private Boolean canCreateAnnouncements;
        private Boolean canManageGroupChats;
        private Boolean canViewAuditLogs;
    }
    
    @GetMapping
    public ResponseEntity<List<ModeratorDetailsDTO>> getCommunityModerators(
            @PathVariable Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ModeratorDetailsDTO> moderators = moderatorService.getCommunityModerators(communityId);
        return ResponseEntity.ok(moderators);
    }
    
    @GetMapping("/{moderatorId}")
    public ResponseEntity<ModeratorDetailsDTO> getModeratorDetails(
            @PathVariable Long communityId,
            @PathVariable Long moderatorId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        ModeratorDetailsDTO moderator = moderatorService.getModeratorDetails(communityId, moderatorId);
        return ResponseEntity.ok(moderator);
    }
    
    @PutMapping("/{moderatorId}/permissions")
    public ResponseEntity<Map<String, Object>> updatePermissions(
            @PathVariable Long communityId,
            @PathVariable Long moderatorId,
            @RequestBody UpdatePermissionsRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Only administrators can update moderator permissions
        if (!membershipService.isAdministrator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators can update moderator permissions")
            );
        }
        
        try {
            ModeratorPermission permissions = new ModeratorPermission();
            permissions.setCanApproveJoinRequests(request.getCanApproveJoinRequests() != null ? request.getCanApproveJoinRequests() : false);
            permissions.setCanAddMembers(request.getCanAddMembers() != null ? request.getCanAddMembers() : false);
            permissions.setCanRemoveMembers(request.getCanRemoveMembers() != null ? request.getCanRemoveMembers() : false);
            permissions.setCanManageChannels(request.getCanManageChannels() != null ? request.getCanManageChannels() : false);
            permissions.setCanDeleteMessages(request.getCanDeleteMessages() != null ? request.getCanDeleteMessages() : false);
            permissions.setCanCreateAnnouncements(request.getCanCreateAnnouncements() != null ? request.getCanCreateAnnouncements() : false);
            permissions.setCanManageGroupChats(request.getCanManageGroupChats() != null ? request.getCanManageGroupChats() : false);
            permissions.setCanViewAuditLogs(request.getCanViewAuditLogs() != null ? request.getCanViewAuditLogs() : false);
            
            ModeratorDetailsDTO moderator = moderatorService.updatePermissions(moderatorId, permissions);
            
            Map<String, Object> response = new HashMap<>();
            response.put("moderator", moderator);
            response.put("message", "Permissions updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to update permissions: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/{moderatorId}/actions")
    public ResponseEntity<List<ActivityDTO>> getModeratorActions(
            @PathVariable Long communityId,
            @PathVariable Long moderatorId,
            @RequestParam(defaultValue = "50") int limit,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or the moderator themselves
        if (!membershipService.isAdministrator(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ActivityDTO> actions = moderatorService.getModeratorActions(moderatorId, limit);
        return ResponseEntity.ok(actions);
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
