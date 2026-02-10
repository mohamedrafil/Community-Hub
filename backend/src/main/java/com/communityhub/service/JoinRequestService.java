package com.communityhub.service;

import com.communityhub.dto.JoinRequestDTO;
import com.communityhub.dto.UserDTO;
import com.communityhub.model.JoinRequest;
import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.JoinRequestRepository;
import com.communityhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JoinRequestService {
    
    private final JoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService;
    private final ActivityService activityService;
    
    public List<JoinRequestDTO> getPendingRequests(Long communityId) {
        return joinRequestRepository.findByCommunityIdAndStatus(
                communityId, 
                JoinRequest.RequestStatus.PENDING
        ).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<JoinRequestDTO> getAllRequests(Long communityId) {
        return joinRequestRepository.findAll().stream()
                .filter(jr -> jr.getCommunity().getId().equals(communityId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    @SuppressWarnings("null")
    public JoinRequestDTO approveRequest(Long requestId, Long approverId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Join request not found"));
        
        if (request.getStatus() != JoinRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Join request has already been reviewed");
        }
        
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));
        
        // Create membership
        Membership membership = new Membership();
        membership.setUser(request.getUser());
        membership.setCommunity(request.getCommunity());
        membership.setRole(Membership.RoleType.MEMBER);
        membership.setIsActive(true);
        membershipService.saveMembership(membership);
        
        // Update join request
        request.setStatus(JoinRequest.RequestStatus.APPROVED);
        request.setReviewedBy(approver);
        request.setReviewedAt(LocalDateTime.now());
        
        JoinRequest updated = joinRequestRepository.save(request);
        
        // Log activity
        activityService.logActivity(
                request.getUser().getId(),
                request.getCommunity().getId(),
                "JOIN_REQUEST_APPROVED",
                "Join request approved by " + approver.getFullName(),
                null
        );
        
        return convertToDTO(updated);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public JoinRequestDTO rejectRequest(Long requestId, Long reviewerId, String reason) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Join request not found"));
        
        if (request.getStatus() != JoinRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Join request has already been reviewed");
        }
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        
        request.setStatus(JoinRequest.RequestStatus.REJECTED);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNote(reason);
        
        JoinRequest updated = joinRequestRepository.save(request);
        
        // Log activity
        activityService.logActivity(
                request.getUser().getId(),
                request.getCommunity().getId(),
                "JOIN_REQUEST_REJECTED",
                "Join request rejected by " + reviewer.getFullName(),
                null
        );
        
        return convertToDTO(updated);
    }
    
    public long getPendingRequestCount(Long communityId) {
        return joinRequestRepository.findByCommunityIdAndStatus(
                communityId,
                JoinRequest.RequestStatus.PENDING
        ).size();
    }
    
    @Transactional
    @SuppressWarnings("null")
    public void deleteRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Join request not found"));
        
        joinRequestRepository.delete(request);
    }
    
    private JoinRequestDTO convertToDTO(JoinRequest request) {
        UserDTO userDTO = convertUserToDTO(request.getUser());
        UserDTO reviewerDTO = request.getReviewedBy() != null 
                ? convertUserToDTO(request.getReviewedBy()) 
                : null;
        
        return JoinRequestDTO.builder()
                .id(request.getId())
                .user(userDTO)
                .message(request.getMessage())
                .status(request.getStatus().name())
                .requestedAt(request.getCreatedAt())
                .reviewedBy(reviewerDTO)
                .reviewedAt(request.getReviewedAt())
                .reviewNote(request.getReviewNote())
                .build();
    }
    
    private UserDTO convertUserToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .department(user.getDepartment())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
