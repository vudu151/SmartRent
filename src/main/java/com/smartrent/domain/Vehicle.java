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
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a Vehicle registered by a Resident (Xe đăng ký gửi)
 */
@Entity
@org.hibernate.annotations.FilterDef(name = "buildingFilter", parameters = @org.hibernate.annotations.ParamDef(name = "buildingId", type = Long.class))
@org.hibernate.annotations.Filter(name = "buildingFilter", condition = "building_id = :buildingId")
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_building_id", columnList = "building_id"),
    @Index(name = "idx_vehicle_resident_id", columnList = "resident_id"),
    @Index(name = "idx_vehicle_type", columnList = "vehicle_type"),
    @Index(name = "idx_vehicle_license_plate", columnList = "license_plate")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_vehicle_plate_building", columnNames = {"license_plate", "building_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate", nullable = false, length = 20)
    private String licensePlate;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 30)
    private VehicleType vehicleType;

    @Column(length = 100)
    private String brand;

    @Column(length = 50)
    private String color;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "monthly_fee", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal monthlyFee = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
