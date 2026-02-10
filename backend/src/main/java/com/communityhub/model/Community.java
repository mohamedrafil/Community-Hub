package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "communities",
    indexes = {
        @Index(name = "idx_community_is_private", columnList = "is_private"),
        @Index(name = "idx_community_is_active", columnList = "is_active"),
        @Index(name = "idx_community_join_code", columnList = "join_code")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Community {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 2000)
    private String description;
    
    @Column(nullable = false)
    private Boolean isPrivate = false;
    
    @Column(unique = true, nullable = false)
    private String joinCode = UUID.randomUUID().toString();
    
    private String logoUrl;
    
    @Column(nullable = false)
    private Boolean allowMemberToMemberDM = true;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Membership> memberships = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Channel> channels = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JoinRequest> joinRequests = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Announcement> announcements = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GroupChat> groupChats = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Activity> activities = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Invite> invites = new HashSet<>();
    
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DMMessage> dmMessages = new HashSet<>();
}
