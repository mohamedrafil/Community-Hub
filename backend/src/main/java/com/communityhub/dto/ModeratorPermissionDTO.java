package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModeratorPermissionDTO {
    private Long id;
    private Boolean canApproveJoinRequests;
    private Boolean canAddMembers;
    private Boolean canRemoveMembers;
    private Boolean canManageChannels;
    private Boolean canDeleteMessages;
    private Boolean canCreateAnnouncements;
    private Boolean canManageGroupChats;
    private Boolean canViewAuditLogs;
}
