package com.smartrent.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {
    private Long tenantId;
    private Long senderId;
    private String title;
    private String content;
    private String type;
    private List<Long> recipientIds;
}
