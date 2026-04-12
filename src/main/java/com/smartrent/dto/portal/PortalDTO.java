package com.smartrent.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortalDTO {

    private String roomNumber;
    private ResidentInfo resident;
    private ContractInfo contract;
    private BankInfo bankInfo;
    private List<BillInfo> unpaidBills;
    private BigDecimal totalUnpaidAmount;

    @Data
    @Builder
    public static class ResidentInfo {
        private String fullName;
        private String phone;
    }

    @Data
    @Builder
    public static class ContractInfo {
        private String contractNumber;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal monthlyRent;
    }

    @Data
    @Builder
    public static class BankInfo {
        private String bankName;
        private String bankAccount;
        private String bankOwner;
    }

    @Data
    @Builder
    public static class BillInfo {
        private Long billId;
        private String billType;
        private String title;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String description;
    }
}
