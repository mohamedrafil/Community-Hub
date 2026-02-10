package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities",
    indexes = {
        @Index(name = "idx_activity_user_id", columnList = "user_id"),
        @Index(name = "idx_activity_community_id", columnList = "community_id"),
        @Index(name = "idx_activity_timestamp", columnList = "timestamp"),
        @Index(name = "idx_activity_type", columnList = "activity_type"),
        @Index(name = "idx_activity_user_community", columnList = "user_id, community_id, timestamp")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;
    
    @Column(nullable = false)
    private String activityType; // MESSAGE_SENT, MEMBER_ADDED, ROLE_CHANGED, etc.
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 2000)
    private String metadata; // JSON string for additional data
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
