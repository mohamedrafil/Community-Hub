package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_chat_id", nullable = false)
    private GroupChat groupChat;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User sender;
    
    @Column(nullable = false, length = 5000)
    private String content;
    
    private String attachmentUrl;
    
    private String attachmentName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    private GroupChatMessage parentMessage;
    
    @Column(nullable = false)
    private Boolean isPinned = false;
    
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime editedAt;
}
