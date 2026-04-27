package com.smartrent.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a Resident (Cư dân / Người thuê trọ)
 */
@Entity
@org.hibernate.annotations.FilterDef(name = "buildingFilter", parameters = @org.hibernate.annotations.ParamDef(name = "buildingId", type = Long.class))
@org.hibernate.annotations.Filter(name = "buildingFilter", condition = "(id IN (SELECT rr.resident_id FROM resident_rooms rr JOIN rooms r ON r.id = rr.room_id WHERE r.building_id = :buildingId) OR NOT EXISTS (SELECT 1 FROM resident_rooms rr2 WHERE rr2.resident_id = id))")
@Table(name = "residents", indexes = {
    @Index(name = "idx_residents_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_residents_user_id", columnList = "user_id"),
    @Index(name = "idx_residents_status", columnList = "status")
})
@Data
@EqualsAndHashCode(exclude = {"rooms", "vehicles"})
@ToString(exclude = {"rooms", "vehicles"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "id_card", length = 50)
    private String idCard;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender;

    @Column(name = "id_card_image_url", columnDefinition = "TEXT")
    private String idCardImageUrl;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    @Builder.Default
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ResidentStatus status = ResidentStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToMany(mappedBy = "residents", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

    @OneToMany(mappedBy = "resident", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Vehicle> vehicles = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ResidentStatus {
        ACTIVE,        // Đang ở
        INACTIVE,      // Đã rời
        TEMPORARY      // Tạm trú
    }
}
