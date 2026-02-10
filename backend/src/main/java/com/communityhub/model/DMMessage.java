package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dm_messages",
    indexes = {
        @Index(name = "idx_dm_message_sender_id", columnList = "sender_id"),
        @Index(name = "idx_dm_message_receiver_id", columnList = "receiver_id"),
        @Index(name = "idx_dm_message_community_id", columnList = "community_id"),
        @Index(name = "idx_dm_message_is_read", columnList = "is_read"),
        @Index(name = "idx_dm_message_created_at", columnList = "created_at"),
        @Index(name = "idx_dm_message_conversation", columnList = "sender_id, receiver_id, created_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DMMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;
    
    @Column(nullable = false, length = 5000)
    private String content;
    
    private String attachmentUrl;
    
    private String attachmentName;
    
    @Column(nullable = false)
    private Boolean isRead = false;
    
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime readAt;
}
