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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a Room/Apartment in the system (multi-tenant)
 */
@Entity
@Table(name = "rooms", indexes = {
    @Index(name = "idx_rooms_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_rooms_status", columnList = "status"),
    @Index(name = "idx_rooms_floor", columnList = "floor"),
    @Index(name = "idx_rooms_type", columnList = "type")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id", "room_number"})
})
@Data
@EqualsAndHashCode(exclude = {"residents"})
@ToString(exclude = {"residents"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column
    private Integer floor;

    @Column(precision = 10, scale = 2)
    private BigDecimal area;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private RoomStatus status = RoomStatus.VACANT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private RoomType type = RoomType.STANDARD;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "resident_rooms",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "resident_id")
    )
    @Builder.Default
    private Set<Resident> residents = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RoomStatus {
        VACANT,       // Trống
        OCCUPIED,     // Đang ở
        MAINTENANCE   // Bảo trì
    }

    public enum RoomType {
        STANDARD,     // Phòng thường
        KIOT,         // Ki-ốt
        PENTHOUSE     // Penthouse/cao cấp
    }
}
