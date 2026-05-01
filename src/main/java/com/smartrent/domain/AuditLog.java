package com.smartrent.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId; // The landlord's workspace

    private String username; // The user who did the action
    
    private String action; // CREATE, UPDATE, DELETE, LOGIN, vb
    
    private String entityName; // e.g., "Room", "Contract", "Bill"
    
    private Long entityId; // The ID of the affected entity
    
    @Column(columnDefinition = "TEXT")
    private String details; // Extra details
    
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
