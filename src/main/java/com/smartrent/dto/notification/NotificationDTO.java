package com.smartrent.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String content;
    private String type;
    private String targetType;
    private String senderName;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
