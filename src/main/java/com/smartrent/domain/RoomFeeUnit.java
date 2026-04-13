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
 * Entity for Room Fee Unit configuration per tenant
 */
@Entity
@Table(name = "room_fee_units", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomFeeUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "rent_per_sqm", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal rentPerSqm = BigDecimal.ZERO;

    @Column(name = "service_per_sqm", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal servicePerSqm = BigDecimal.ZERO;

    @Column(name = "parking_fee", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal parkingFee = BigDecimal.ZERO;

    @Column(name = "water_per_unit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal waterPerUnit = BigDecimal.ZERO;

    @Column(name = "electricity_per_unit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal electricityPerUnit = BigDecimal.ZERO;

    @Column(name = "internet_fee", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal internetFee = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
