package com.communityhub.controller;

import com.communityhub.dto.MessageDTO;
import com.communityhub.model.Community;
import com.communityhub.model.DMMessage;
import com.communityhub.model.User;
import com.communityhub.repository.CommunityRepository;
import com.communityhub.repository.DMMessageRepository;
import com.communityhub.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final DMMessageRepository dmMessageRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    
    @Data
    public static class ChatMessage {
        private Long receiverId;
        private Long communityId;
        private String content;
        private String type; // "DM", "GROUP", "CHANNEL"
    }
    
    @MessageMapping("/chat.sendMessage")
    @SuppressWarnings("null")
    public void sendMessage(@Payload ChatMessage message, Authentication authentication) {
        try {
            String senderEmail = authentication.getName();
            User sender = userRepository.findByEmail(senderEmail)
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            User receiver = userRepository.findById(message.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            
            // Prevent sending messages to yourself
            if (sender.getId().equals(receiver.getId())) {
                throw new RuntimeException("You cannot send messages to yourself");
            }
            
            Community community = communityRepository.findById(message.getCommunityId())
                    .orElseThrow(() -> new RuntimeException("Community not found"));
            
            // Save DM message
            DMMessage dmMessage = new DMMessage();
            dmMessage.setSender(sender);
            dmMessage.setReceiver(receiver);
            dmMessage.setCommunity(community);
            dmMessage.setContent(message.getContent());
            dmMessage.setIsRead(false);
            dmMessage.setIsDeleted(false);
            
            DMMessage saved = dmMessageRepository.save(dmMessage);
            
            System.out.println("✅ Message saved to database with ID: " + saved.getId());
            System.out.println("   Sender: " + sender.getId() + " (" + sender.getEmail() + ")");
            System.out.println("   Receiver: " + receiver.getId() + " (" + receiver.getEmail() + ")");
            System.out.println("   Community: " + community.getId());
            System.out.println("   Content: " + saved.getContent());
            
            // Convert to DTO
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setId(saved.getId());
            messageDTO.setSenderId(sender.getId());
            messageDTO.setReceiverId(receiver.getId());
            messageDTO.setSenderName(sender.getFullName());
            messageDTO.setSenderEmail(sender.getEmail());
            messageDTO.setContent(saved.getContent());
            messageDTO.setIsRead(false);
            messageDTO.setCreatedAt(saved.getCreatedAt().toString());
            messageDTO.setTimestamp(saved.getCreatedAt().toString());
            
            System.out.println("📤 Sending message to receiver: " + receiver.getEmail());
            // Send to receiver
            messagingTemplate.convertAndSendToUser(
                    receiver.getEmail(),
                    "/queue/messages",
                    messageDTO
            );
            
            System.out.println("📤 Sending confirmation to sender: " + sender.getEmail());
            // Send confirmation to sender
            messagingTemplate.convertAndSendToUser(
                    sender.getEmail(),
                    "/queue/messages",
                    messageDTO
            );
            
        } catch (Exception e) {
            System.err.println("Error saving message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send message: " + e.getMessage(), e);
        }
    }
    
    @MessageMapping("/chat.markAsRead")
    @SuppressWarnings("null")
    public void markAsRead(@Payload Long messageId, Authentication authentication) {
        DMMessage message = dmMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        dmMessageRepository.save(message);
    }
}
