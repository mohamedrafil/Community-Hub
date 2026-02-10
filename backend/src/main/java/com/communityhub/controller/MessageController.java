package com.communityhub.controller;

import com.communityhub.dto.MessageDTO;
import com.communityhub.model.DMMessage;
import com.communityhub.model.User;
import com.communityhub.repository.DMMessageRepository;
import com.communityhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {
    
    private final DMMessageRepository dmMessageRepository;
    private final UserRepository userRepository;
    
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @RequestParam Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        try {
            List<Object> participants = dmMessageRepository.findConversationParticipants(
                    user.getId(), 
                    communityId
            );
            
            List<Map<String, Object>> conversations = participants.stream()
                    .map(p -> {
                        User participant = (User) p;
                        Map<String, Object> conv = new HashMap<>();
                        conv.put("userId", participant.getId());
                        conv.put("name", participant.getFullName());
                        conv.put("email", participant.getEmail());
                        conv.put("profileImageUrl", participant.getProfileImageUrl());
                        
                        // Get last message between users
                        List<DMMessage> recentMessages = dmMessageRepository.findTopByUsersOrderByCreatedAtDesc(
                                user.getId(), participant.getId());
                        if (!recentMessages.isEmpty()) {
                            DMMessage lastMsg = recentMessages.get(0);
                            conv.put("lastMessage", lastMsg.getContent());
                            conv.put("lastMessageTime", lastMsg.getCreatedAt().toString());
                            conv.put("lastMessageSenderId", lastMsg.getSender().getId());
                        }
                        
                        // Calculate unread count
                        Long unreadCount = dmMessageRepository.countBySenderIdAndReceiverIdAndIsReadFalseAndIsDeletedFalse(
                                participant.getId(), user.getId());
                        conv.put("unreadCount", unreadCount);
                        
                        return conv;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            System.err.println("Error fetching conversations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list instead of error
        }
    }
    
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable Long otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        Page<DMMessage> messages = dmMessageRepository.findConversation(
                user.getId(),
                otherUserId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        
        List<MessageDTO> messageDTOs = messages.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("messages", messageDTOs);
        response.put("totalPages", messages.getTotalPages());
        response.put("totalElements", messages.getTotalElements());
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        
        Long count = dmMessageRepository.countByReceiverIdAndIsReadFalseAndIsDeletedFalse(user.getId());
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }
    
    private MessageDTO convertToDTO(DMMessage message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setContent(message.getContent());
        dto.setAttachmentUrl(message.getAttachmentUrl());
        dto.setAttachmentName(message.getAttachmentName());
        dto.setIsRead(message.getIsRead());
        dto.setCreatedAt(message.getCreatedAt().toString());
        dto.setTimestamp(message.getCreatedAt().toString());
        return dto;
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
