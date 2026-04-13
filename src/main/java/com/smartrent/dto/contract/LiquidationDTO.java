package com.smartrent.dto.contract;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiquidationDTO {

    private Long contractId;
    private String contractNumber;
    private String roomNumber;
    private String residentName;

    private BigDecimal depositAmount; // Tiền cọc
    private List<BillDebts> unpaidBills; // Các hóa đơn chưa thanh toán
    private BigDecimal proRatedRent; // Tiền phòng lẻ ngày (tính toán dựa trên số ngày ở thêm)
    private BigDecimal otherDeductions; // Các khoản trừ khác (đền bù...)
    
    private BigDecimal totalDebts; // Tổng nợ = Bills + ProRated + Other
    private BigDecimal finalRefund; // Số tiền hoàn trả = Deposit - TotalDebts

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BillDebts {
        private String title;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Integer stayDays; // Số ngày lẻ ở thêm
        private BigDecimal otherDeductions; // Phí hư hỏng, đền bù
        private String notes;
    }
}
