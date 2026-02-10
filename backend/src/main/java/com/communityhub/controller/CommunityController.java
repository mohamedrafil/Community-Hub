package com.communityhub.controller;

import com.communityhub.dto.CommunityDTO;
import com.communityhub.model.Community;
import com.communityhub.model.JoinRequest;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.JoinRequestRepository;
import com.communityhub.repository.UserRepository;
import com.communityhub.service.CommunityService;
import com.communityhub.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CommunityController {
    
    private final CommunityService communityService;
    private final MembershipService membershipService;
    private final UserRepository userRepository;
    private final JoinRequestRepository joinRequestRepository;
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateCommunityRequest {
        @jakarta.validation.constraints.NotBlank(message = "Community name is required")
        @jakarta.validation.constraints.Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
        private String name;
        
        @jakarta.validation.constraints.Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;
        
        private Boolean isPrivate;
        private String logoUrl;
        private Boolean allowMemberToMemberDM;
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class JoinCommunityRequest {
        private String joinCode;
        private String message;
    }
    
    @GetMapping
    public ResponseEntity<List<CommunityDTO>> getAllCommunities() {
        List<CommunityDTO> communities = communityService.getAllCommunities().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(communities);
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<Map<String, Object>>> getPublicCommunities() {
        List<Community> publicCommunities = communityService.getAllCommunities().stream()
                .filter(c -> !c.getIsPrivate() && c.getIsActive())
                .collect(Collectors.toList());
        
        List<Map<String, Object>> result = publicCommunities.stream()
                .map(community -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", community.getId());
                    data.put("name", community.getName());
                    data.put("description", community.getDescription());
                    data.put("memberCount", membershipService.getCommunityMemberCount(community.getId()));
                    return data;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CommunityDTO> getCommunityById(
            @PathVariable Long id,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        return communityService.getCommunityById(id)
                .map(community -> {
                    CommunityDTO dto = convertToDTO(community);
                    
                    // Include user's role in this community
                    membershipService.getMembership(user.getId(), id)
                            .ifPresent(membership -> dto.setRole(membership.getRole().name()));
                    
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/my-communities")
    public ResponseEntity<List<CommunityDTO>> getMyCommunities(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        
        List<CommunityDTO> communities = membershipService.getUserMemberships(user.getId()).stream()
                .map(membership -> {
                    CommunityDTO dto = convertToDTO(membership.getCommunity());
                    dto.setRole(membership.getRole().name());
                    dto.setMemberCount(membershipService.getCommunityMemberCount(membership.getCommunity().getId()));
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(communities);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCommunity(
            @jakarta.validation.Valid @RequestBody CreateCommunityRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        Community community = new Community();
        community.setName(request.getName());
        community.setDescription(request.getDescription());
        community.setIsPrivate(request.getIsPrivate() != null ? request.getIsPrivate() : false);
        community.setLogoUrl(request.getLogoUrl());
        community.setAllowMemberToMemberDM(request.getAllowMemberToMemberDM() != null ? 
                request.getAllowMemberToMemberDM() : true);
        community.setIsActive(true);
        
        Community savedCommunity = communityService.createCommunity(community);
        
        // Add creator as administrator
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setCommunity(savedCommunity);
        membership.setRole(Membership.RoleType.ADMINISTRATOR);
        membership.setIsActive(true);
        membershipService.saveMembership(membership);
        
        Map<String, Object> response = new HashMap<>();
        response.put("community", convertToDTO(savedCommunity));
        response.put("message", "Community created successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/join/{joinCode}")
    public ResponseEntity<Map<String, String>> joinCommunity(
            @PathVariable String joinCode,
            @RequestBody(required = false) JoinCommunityRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        Community community = communityService.getCommunityByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Invalid join code"));
        
        // Check if already a member
        if (membershipService.isMember(user.getId(), community.getId())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "You are already a member of this community");
            return ResponseEntity.ok(response);
        }
        
        if (!community.getIsPrivate()) {
            // Public community - instant join
            Membership membership = new Membership();
            membership.setUser(user);
            membership.setCommunity(community);
            membership.setRole(Membership.RoleType.MEMBER);
            membership.setIsActive(true);
            membershipService.saveMembership(membership);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Successfully joined community");
            return ResponseEntity.ok(response);
        } else {
            // Private community - create join request
            JoinRequest joinRequest = new JoinRequest();
            joinRequest.setUser(user);
            joinRequest.setCommunity(community);
            joinRequest.setMessage(request != null ? request.getMessage() : null);
            joinRequest.setStatus(JoinRequest.RequestStatus.PENDING);
            joinRequestRepository.save(joinRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Join request submitted for approval");
            return ResponseEntity.ok(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CommunityDTO> updateCommunity(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody CreateCommunityRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        if (!membershipService.isAdministrator(user.getId(), id)) {
            return ResponseEntity.status(403).build();
        }
        
        Community community = new Community();
        community.setName(request.getName());
        community.setDescription(request.getDescription());
        community.setIsPrivate(request.getIsPrivate());
        community.setLogoUrl(request.getLogoUrl());
        community.setAllowMemberToMemberDM(request.getAllowMemberToMemberDM());
        
        Community updated = communityService.updateCommunity(id, community);
        return ResponseEntity.ok(convertToDTO(updated));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCommunity(
            @PathVariable Long id,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Only administrators can delete communities
        if (!membershipService.isAdministrator(user.getId(), id)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Only administrators can delete communities");
            return ResponseEntity.status(403).body(error);
        }
        
        try {
            System.out.println("Attempting to delete community with ID: " + id);
            communityService.deleteCommunity(id);
            System.out.println("Successfully deleted community with ID: " + id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Community deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error deleting community: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete community: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private CommunityDTO convertToDTO(Community community) {
        return CommunityDTO.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .isPrivate(community.getIsPrivate())
                .joinCode(community.getJoinCode())
                .logoUrl(community.getLogoUrl())
                .allowMemberToMemberDM(community.getAllowMemberToMemberDM())
                .isActive(community.getIsActive())
                .createdAt(community.getCreatedAt().toString())
                .build();
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
