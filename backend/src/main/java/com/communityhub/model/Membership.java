package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "memberships", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "community_id"})
    },
    indexes = {
        @Index(name = "idx_membership_user_id", columnList = "user_id"),
        @Index(name = "idx_membership_community_id", columnList = "community_id"),
        @Index(name = "idx_membership_role", columnList = "role"),
        @Index(name = "idx_membership_is_active", columnList = "is_active"),
        @Index(name = "idx_membership_moderator_permission_id", columnList = "moderator_permission_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Membership {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleType role = RoleType.MEMBER;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "moderator_permission_id")
    private ModeratorPermission moderatorPermission;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum RoleType {
        ADMINISTRATOR,
        MODERATOR,
        MEMBER
    }
}
