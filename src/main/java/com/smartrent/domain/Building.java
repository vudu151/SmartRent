package com.smartrent.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a Building or Property (Khu trọ) managed by a Tenant.
 * Each Building has its own configuration for service prices.
 */
@Entity
@Table(name = "buildings", indexes = {
    @Index(name = "idx_buildings_tenant_id", columnList = "tenant_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "electricity_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal electricityPrice = BigDecimal.ZERO;

    @Column(name = "water_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal waterPrice = BigDecimal.ZERO;

    @Column(name = "service_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal servicePrice = BigDecimal.ZERO;

    @Column(name = "internet_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal internetPrice = BigDecimal.ZERO;

    @Column(name = "parking_price", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal parkingPrice = BigDecimal.ZERO;

    @Column(name = "meter_recording_start_day")
    @Builder.Default
    private Integer meterRecordingStartDay = 1;

    @Column(name = "meter_recording_end_day")
    @Builder.Default
    private Integer meterRecordingEndDay = 31;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
