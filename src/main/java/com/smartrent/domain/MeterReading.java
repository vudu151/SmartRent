package com.smartrent.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a meter reading (Electricity or Water) for a room in a specific month
 */
@Entity
@Filter(name = "buildingFilter", condition = "room_id IN (SELECT r.id FROM rooms r WHERE r.building_id = :buildingId)")
@Table(name = "meter_readings", indexes = {
    @Index(name = "idx_meter_readings_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_meter_readings_room_id", columnList = "room_id"),
    @Index(name = "idx_meter_readings_type", columnList = "type"),
    @Index(name = "idx_meter_readings_period", columnList = "reading_month, reading_year")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"room_id", "type", "reading_month", "reading_year"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MeterType type;

    @Column(name = "reading_month", nullable = false)
    private Integer readingMonth;

    @Column(name = "reading_year", nullable = false)
    private Integer readingYear;

    @Column(name = "old_index", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal oldIndex = BigDecimal.ZERO;

    @Column(name = "new_index", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal newIndex = BigDecimal.ZERO;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
