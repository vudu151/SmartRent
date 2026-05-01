package com.smartrent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String username;
    private String action;
    private String entityName;
    private Long entityId;
    private String details;
    private LocalDateTime timestamp;
}
