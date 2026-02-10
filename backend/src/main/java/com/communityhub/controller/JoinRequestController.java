package com.communityhub.controller;

import com.communityhub.dto.JoinRequestDTO;
import com.communityhub.model.User;
import com.communityhub.repository.UserRepository;
import com.communityhub.service.JoinRequestService;
import com.communityhub.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities/{communityId}/join-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class JoinRequestController {
    
    private final JoinRequestService joinRequestService;
    private final MembershipService membershipService;
    private final UserRepository userRepository;
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReviewRequest {
        @jakarta.validation.constraints.Size(max = 1000, message = "Review note must not exceed 1000 characters")
        private String reviewNote;
    }
    
    @GetMapping
    public ResponseEntity<List<JoinRequestDTO>> getJoinRequests(
            @PathVariable Long communityId,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<JoinRequestDTO> requests;
        if ("pending".equalsIgnoreCase(status)) {
            requests = joinRequestService.getPendingRequests(communityId);
        } else {
            requests = joinRequestService.getAllRequests(communityId);
        }
        
        return ResponseEntity.ok(requests);
    }
    
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<Map<String, Object>> approveRequest(
            @PathVariable Long communityId,
            @PathVariable Long requestId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can approve join requests")
            );
        }
        
        try {
            JoinRequestDTO request = joinRequestService.approveRequest(requestId, user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("request", request);
            response.put("message", "Join request approved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to approve request: " + e.getMessage())
            );
        }
    }
    
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable Long communityId,
            @PathVariable Long requestId,
            @RequestBody(required = false) ReviewRequest reviewRequest,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can reject join requests")
            );
        }
        
        try {
            String reason = reviewRequest != null ? reviewRequest.getReviewNote() : null;
            JoinRequestDTO request = joinRequestService.rejectRequest(requestId, user.getId(), reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("request", request);
            response.put("message", "Join request rejected");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to reject request: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingCount(
            @PathVariable Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        long count = joinRequestService.getPendingRequestCount(communityId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @DeleteMapping("/{requestId}")
    public ResponseEntity<Map<String, String>> deleteRequest(
            @PathVariable Long communityId,
            @PathVariable Long requestId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can delete join requests")
            );
        }
        
        try {
            joinRequestService.deleteRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Join request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to delete request: " + e.getMessage())
            );
        }
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
