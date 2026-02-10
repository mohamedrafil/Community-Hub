package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "moderator_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModeratorPermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Boolean canApproveJoinRequests = false;
    
    @Column(nullable = false)
    private Boolean canAddMembers = false;
    
    @Column(nullable = false)
    private Boolean canRemoveMembers = false;
    
    @Column(nullable = false)
    private Boolean canManageChannels = false;
    
    @Column(nullable = false)
    private Boolean canDeleteMessages = false;
    
    @Column(nullable = false)
    private Boolean canCreateAnnouncements = false;
    
    @Column(nullable = false)
    private Boolean canManageGroupChats = false;
    
    @Column(nullable = false)
    private Boolean canViewAuditLogs = false;
}
