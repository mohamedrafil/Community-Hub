package com.communityhub.controller;

import com.communityhub.dto.ActivityDTO;
import com.communityhub.dto.MemberDetailsDTO;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.UserRepository;
import com.communityhub.service.MemberManagementService;
import com.communityhub.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities/{communityId}/members")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MemberController {
    
    private final MemberManagementService memberManagementService;
    private final MembershipService membershipService;
    private final UserRepository userRepository;
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AddMemberRequest {
        private Long userId;
        
        @jakarta.validation.constraints.Email(message = "Valid email is required")
        private String email;
        
        @jakarta.validation.constraints.Pattern(regexp = "ADMINISTRATOR|MODERATOR|MEMBER", message = "Role must be ADMINISTRATOR, MODERATOR, or MEMBER")
        private String role; // ADMINISTRATOR, MODERATOR, MEMBER
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ChangeRoleRequest {
        @jakarta.validation.constraints.NotBlank(message = "Role is required")
        @jakarta.validation.constraints.Pattern(regexp = "ADMINISTRATOR|MODERATOR|MEMBER", message = "Role must be ADMINISTRATOR, MODERATOR, or MEMBER")
        private String role; // ADMINISTRATOR, MODERATOR, MEMBER
    }
    
    @GetMapping
    public ResponseEntity<List<MemberDetailsDTO>> getCommunityMembers(
            @PathVariable Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<MemberDetailsDTO> members = memberManagementService.getCommunityMembers(communityId);
        return ResponseEntity.ok(members);
    }
    
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberDetailsDTO> getMemberDetails(
            @PathVariable Long communityId,
            @PathVariable Long memberId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        MemberDetailsDTO member = memberManagementService.getMemberDetails(communityId, memberId);
        return ResponseEntity.ok(member);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> addMember(
            @PathVariable Long communityId,
            @jakarta.validation.Valid @RequestBody AddMemberRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can add members")
            );
        }
        
        try {
            // Find user by email or userId
            Long targetUserId = request.getUserId();
            if (targetUserId == null && request.getEmail() != null) {
                User targetUser = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
                targetUserId = targetUser.getId();
            }
            
            if (targetUserId == null) {
                return ResponseEntity.badRequest().body(
                    Map.of("message", "Either userId or email must be provided")
                );
            }
            
            Membership.RoleType role = Membership.RoleType.MEMBER;
            if (request.getRole() != null) {
                role = Membership.RoleType.valueOf(request.getRole().toUpperCase());
            }
            
            MemberDetailsDTO member = memberManagementService.addMember(communityId, targetUserId, role);
            
            Map<String, Object> response = new HashMap<>();
            response.put("member", member);
            response.put("message", "Member added successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to add member: " + e.getMessage())
            );
        }
    }
    
    @PutMapping("/{memberId}/role")
    public ResponseEntity<Map<String, Object>> changeMemberRole(
            @PathVariable Long communityId,
            @PathVariable Long memberId,
            @jakarta.validation.Valid @RequestBody ChangeRoleRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Only administrators can change roles
        if (!membershipService.isAdministrator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators can change member roles")
            );
        }
        
        try {
            Membership.RoleType newRole = Membership.RoleType.valueOf(request.getRole().toUpperCase());
            MemberDetailsDTO member = memberManagementService.changeMemberRole(communityId, memberId, newRole);
            
            Map<String, Object> response = new HashMap<>();
            response.put("member", member);
            response.put("message", "Member role changed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to change role: " + e.getMessage())
            );
        }
    }
    
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long communityId,
            @PathVariable Long memberId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can remove members")
            );
        }
        
        try {
            memberManagementService.removeMember(communityId, memberId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to remove member: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/{memberId}/activity")
    public ResponseEntity<List<ActivityDTO>> getMemberActivity(
            @PathVariable Long communityId,
            @PathVariable Long memberId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ActivityDTO> activity = memberManagementService.getMemberActivity(memberId);
        return ResponseEntity.ok(activity);
    }
    
    @PostMapping("/leave")
    public ResponseEntity<Map<String, String>> leaveCommunity(
            @PathVariable Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        try {
            // Check if user is a member
            if (!membershipService.isMember(user.getId(), communityId)) {
                return ResponseEntity.status(403).body(
                    Map.of("message", "You are not a member of this community")
                );
            }
            
            // Prevent the last admin from leaving
            if (membershipService.isAdministrator(user.getId(), communityId)) {
                long adminCount = memberManagementService.getCommunityMembers(communityId)
                    .stream()
                    .filter(m -> "ADMINISTRATOR".equals(m.getRole()))
                    .count();
                
                if (adminCount <= 1) {
                    return ResponseEntity.badRequest().body(
                        Map.of("message", "You are the last administrator. Please assign another administrator before leaving.")
                    );
                }
            }
            
            memberManagementService.removeMember(communityId, user.getId());
            return ResponseEntity.ok(Map.of("message", "Successfully left the community"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to leave community: " + e.getMessage())
            );
        }
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
