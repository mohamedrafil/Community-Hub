package com.communityhub.controller;

import com.communityhub.model.Community;
import com.communityhub.model.Invite;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.CommunityRepository;
import com.communityhub.repository.InviteRepository;
import com.communityhub.repository.UserRepository;
import com.communityhub.service.InviteService;
import com.communityhub.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class InviteController {
    
    private final InviteService inviteService;
    private final MembershipService membershipService;
    private final InviteRepository inviteRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SendInviteRequest {
        @jakarta.validation.constraints.Email(message = "Valid email is required")
        @jakarta.validation.constraints.NotBlank(message = "Email is required")
        private String email;
        
        @jakarta.validation.constraints.Pattern(regexp = "ADMINISTRATOR|MODERATOR|MEMBER", message = "Role must be ADMINISTRATOR, MODERATOR, or MEMBER")
        private String role;
    }
    
    @PostMapping("/api/communities/{communityId}/invites")
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> sendInvite(
            @PathVariable Long communityId,
            @jakarta.validation.Valid @RequestBody SendInviteRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can send invitations")
            );
        }
        
        try {
            Community community = communityRepository.findById(communityId)
                    .orElseThrow(() -> new RuntimeException("Community not found"));
            
            Membership.RoleType roleType = Membership.RoleType.MEMBER;
            if (request.getRole() != null) {
                roleType = Membership.RoleType.valueOf(request.getRole().toUpperCase());
            }
            
            Invite invite = inviteService.createInvite(community, request.getEmail(), user, roleType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("invite", convertToDTO(invite));
            response.put("message", "Invitation sent successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to send invitation: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/api/communities/{communityId}/invites")
    public ResponseEntity<List<Map<String, Object>>> getCommunityInvites(
            @PathVariable Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Invite> invites = inviteService.getCommunityInvites(communityId);
        
        List<Map<String, Object>> result = invites.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/api/communities/{communityId}/invites/{inviteId}")
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, String>> deleteInvite(
            @PathVariable Long communityId,
            @PathVariable Long inviteId,
            @RequestParam(required = false, defaultValue = "false") boolean permanent,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can delete invitations")
            );
        }
        
        try {
            Invite invite = inviteRepository.findById(inviteId)
                    .orElseThrow(() -> new RuntimeException("Invite not found"));
            
            if (!invite.getCommunity().getId().equals(communityId)) {
                return ResponseEntity.status(403).body(
                    Map.of("message", "Invite does not belong to this community")
                );
            }
            
            if (permanent) {
                // Permanently delete the invite
                inviteRepository.delete(invite);
                return ResponseEntity.ok(Map.of("message", "Invitation deleted permanently"));
            } else {
                // Just mark as expired (cancel)
                invite.setIsExpired(true);
                inviteRepository.save(invite);
                return ResponseEntity.ok(Map.of("message", "Invitation cancelled successfully"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to delete invitation: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/api/invites/my")
    public ResponseEntity<List<Map<String, Object>>> getMyInvites(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        
        List<Invite> invites = inviteService.getUserInvites(user.getEmail());
        
        List<Map<String, Object>> result = invites.stream()
                .map(invite -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", invite.getId());
                    dto.put("communityId", invite.getCommunity().getId());
                    dto.put("communityName", invite.getCommunity().getName());
                    dto.put("communityDescription", invite.getCommunity().getDescription());
                    dto.put("inviteToken", invite.getInviteToken());
                    dto.put("roleType", invite.getRoleType().name());
                    dto.put("invitedBy", invite.getInvitedBy().getFullName());
                    dto.put("createdAt", invite.getCreatedAt().toString());
                    dto.put("expiresAt", invite.getExpiresAt().toString());
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/api/invites/{token}/accept")
    public ResponseEntity<Map<String, Object>> acceptInviteAuthenticated(
            @PathVariable String token,
            Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            inviteService.acceptInvite(token, user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Successfully joined the community!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
            );
        }
    }
    
    @GetMapping("/api/invites/{token}/validate")
    public ResponseEntity<Map<String, Object>> validateInvite(@PathVariable String token) {
        try {
            Invite invite = inviteRepository.findByInviteToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", !invite.getIsUsed() && !invite.getIsExpired() && invite.getExpiresAt().isAfter(LocalDateTime.now()));
            response.put("email", invite.getEmail());
            response.put("communityName", invite.getCommunity().getName());
            response.put("role", invite.getRoleType().name());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }
    
    private Map<String, Object> convertToDTO(Invite invite) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", invite.getId());
        dto.put("email", invite.getEmail());
        dto.put("inviteToken", invite.getInviteToken());
        dto.put("roleType", invite.getRoleType().name());
        dto.put("isUsed", invite.getIsUsed());
        dto.put("isExpired", invite.getIsExpired());
        dto.put("createdAt", invite.getCreatedAt().toString());
        dto.put("expiresAt", invite.getExpiresAt().toString());
        dto.put("invitedBy", invite.getInvitedBy().getFullName());
        return dto;
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
