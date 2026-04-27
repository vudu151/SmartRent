package com.smartrent.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a Notification
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_notifications_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    @Builder.Default
    private NotificationType type = NotificationType.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", length = 50)
    @Builder.Default
    private TargetType targetType = TargetType.ALL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "notification_recipients",
        joinColumns = @JoinColumn(name = "notification_id"),
        inverseJoinColumns = @JoinColumn(name = "resident_id")
    )
    @Builder.Default
    private Set<Resident> recipients = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        GENERAL,       // Thông báo chung
        BILL,          // Thông báo hóa đơn
        MAINTENANCE,   // Thông báo bảo trì
        URGENT,        // Thông báo khẩn
        SYSTEM_INFO,   // Hệ thống: Thông tin
        SYSTEM_SUCCESS,// Hệ thống: Thành công
        SYSTEM_WARNING,// Hệ thống: Cảnh báo
        SYSTEM_ERROR   // Hệ thống: Lỗi
    }

    public enum TargetType {
        ALL,           // Tất cả cư dân
        SPECIFIC,      // Cư dân cụ thể
        SYSTEM         // Gửi cho Chủ trọ (Tenant)
    }
}
