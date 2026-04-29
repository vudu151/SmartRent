package com.smartrent.dto.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho phiếu in hóa đơn phòng (Invoice Preview & Print)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomInvoiceDTO {

    // --- Thông tin khu trọ ---
    private String buildingName;
    private String buildingAddress;
    private String tenantPhone;
    private String tenantName;

    // --- Thông tin ngân hàng ---
    private String bankName;
    private String bankAccount;
    private String bankOwner;
    private String bankQrUrl;

    // --- Thông tin phòng ---
    private String roomNumber;
    private String residentName;
    private String residentPhone;

    // --- Kỳ thanh toán ---
    private Integer month;
    private Integer year;

    // --- Chi tiết tiền phòng ---
    private BigDecimal monthlyRent;

    // --- Chi tiết điện ---
    private BigDecimal electricOldIndex;
    private BigDecimal electricNewIndex;
    private BigDecimal electricUsage;
    private BigDecimal electricUnitPrice;
    private BigDecimal electricAmount;

    // --- Chi tiết nước ---
    private BigDecimal waterOldIndex;
    private BigDecimal waterNewIndex;
    private BigDecimal waterUsage;
    private BigDecimal waterUnitPrice;
    private BigDecimal waterAmount;

    // --- Phí dịch vụ ---
    private BigDecimal serviceAmount;
    private BigDecimal internetAmount;
    private BigDecimal parkingAmount;

    // --- Tổng cộng ---
    private BigDecimal totalAmount;

    // --- Trạng thái ---
    private String billStatus; // UNPAID, PAID, OVERDUE
    private String dueDate;
    private String invoiceDate;
}
