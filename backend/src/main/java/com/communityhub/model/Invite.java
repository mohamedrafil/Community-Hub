package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invites",
    indexes = {
        @Index(name = "idx_invite_community_id", columnList = "community_id"),
        @Index(name = "idx_invite_email", columnList = "email"),
        @Index(name = "idx_invite_token", columnList = "invite_token"),
        @Index(name = "idx_invite_is_used", columnList = "is_used"),
        @Index(name = "idx_invite_is_expired", columnList = "is_expired")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;
    
    @Column(nullable = false)
    private String email;
    
    @Column(unique = true, nullable = false)
    private String inviteToken = UUID.randomUUID().toString();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Membership.RoleType roleType = Membership.RoleType.MEMBER;
    
    @Column(nullable = false)
    private Boolean isUsed = false;
    
    @Column(nullable = false)
    private Boolean isExpired = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime usedAt;
    
    private LocalDateTime expiresAt;
}
