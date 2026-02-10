package com.communityhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String senderName;
    private String senderEmail;
    private String content;
    private String attachmentUrl;
    private String attachmentName;
    private Boolean isRead;
    private String createdAt;
    private String timestamp; // Alias for createdAt for frontend compatibility
}
