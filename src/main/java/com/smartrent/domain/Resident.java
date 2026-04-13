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
@Table(name = "residents", indexes = {
    @Index(name = "idx_residents_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_residents_user_id", columnList = "user_id"),
    @Index(name = "idx_residents_status", columnList = "status")
})
@Data
@EqualsAndHashCode(exclude = {"rooms"})
@ToString(exclude = {"rooms"})
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ResidentStatus status = ResidentStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToMany(mappedBy = "residents", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

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
