package com.smartrent.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a Tenant (Chủ trọ)
 * Each tenant represents a rental property owner who uses the SaaS system
 */
@Entity
@Table(name = "tenants", indexes = {
    @Index(name = "idx_tenants_email", columnList = "email"),
    @Index(name = "idx_tenants_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TenantStatus status = TenantStatus.ACTIVE;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(name = "bank_owner", length = 100)
    private String bankOwner;

    @Column(name = "bank_qr_url", length = 500)
    private String bankQrUrl;

    @Column(name = "auto_billing_day")
    @Builder.Default
    private Integer autoBillingDay = 1; // Mặc định là ngày 1 hàng tháng

    @Column(name = "payment_deadline_day")
    @Builder.Default
    private Integer paymentDeadlineDay = 5; // Mặc định hạn là ngày 5

    @Column(name = "reminder_delay_days")
    @Builder.Default
    private Integer reminderDelayDays = 2; // Mặc định trễ 2 ngày thì nhắc

    @Column(name = "reminder_frequency_days")
    @Builder.Default
    private Integer reminderFrequencyDays = 2; // Mặc định nhắc lại mỗi 2 ngày

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TenantStatus {
        ACTIVE,
        SUSPENDED,
        CANCELLED
    }
}
