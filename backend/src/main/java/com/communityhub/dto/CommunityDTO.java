package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean isPrivate;
    private String joinCode;
    private String logoUrl;
    private Boolean allowMemberToMemberDM;
    private Boolean isActive;
    private String createdAt;
    private String role; // User's role in this community
    private Long memberCount;
}
