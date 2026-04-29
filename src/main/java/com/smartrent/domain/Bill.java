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
 * Entity representing a Bill/Invoice
 */
@Entity
@Filter(name = "buildingFilter", condition = "room_id IN (SELECT r.id FROM rooms r WHERE r.building_id = :buildingId)")
@Table(name = "bills", indexes = {
    @Index(name = "idx_bills_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_bills_room_id", columnList = "room_id"),
    @Index(name = "idx_bills_status", columnList = "status"),
    @Index(name = "idx_bills_bill_type", columnList = "bill_type"),
    @Index(name = "idx_bills_due_date", columnList = "due_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false, length = 50)
    private BillType billType;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BillStatus status = BillStatus.UNPAID;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "payment_reference", length = 255)
    private String paymentReference;

    @Column(name = "last_reminder_date")
    private LocalDateTime lastReminderDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BillType {
        RENT,           // Tiền thuê
        ELECTRICITY,    // Tiền điện
        WATER,          // Tiền nước
        SERVICE,        // Phí dịch vụ
        PARKING,        // Phí giữ xe
        INTERNET,       // Phí internet
        CONTRIBUTION,   // Đóng góp
        OTHER           // Khác
    }

    public enum BillStatus {
        UNPAID,    // Chưa thanh toán
        PAID,      // Đã thanh toán
        OVERDUE,   // Quá hạn
        CANCELLED  // Đã hủy
    }
}
