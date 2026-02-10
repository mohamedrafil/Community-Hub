package com.communityhub.dto;

import com.communityhub.model.Membership;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long communityId;
    private String communityName;
    private Membership.RoleType role;
    private ModeratorPermissionDTO moderatorPermission;
    private Boolean isActive;
    private String joinedAt;
}
