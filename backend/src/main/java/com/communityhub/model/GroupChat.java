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

@Entity
@Table(name = "group_chats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupChat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupChatType type = GroupChatType.CUSTOM;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @ManyToMany
    @JoinTable(
        name = "group_chat_members",
        joinColumns = @JoinColumn(name = "group_chat_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();
    
    @OneToMany(mappedBy = "groupChat", cascade = CascadeType.ALL)
    private Set<GroupChatMessage> messages = new HashSet<>();
    
    public enum GroupChatType {
        GENERAL,
        MODERATOR_ONLY,
        ADMIN_ONLY,
        CUSTOM
    }
}
