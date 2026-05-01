package com.smartrent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private Summary summary;
    private List<ChartData> chartData;
    private List<RecentTransaction> recentTransactions;
    private List<ExpiringContract> expiringContractsList;
    private List<RevenueBreakdown> revenueBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private int totalRooms;
        private int occupiedRooms;
        private int vacantRooms;
        private int maintenanceRooms;
        private BigDecimal currentMonthRevenue;
        private BigDecimal totalDebt;
        private int expiringContracts;
        private long pendingTickets;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartData {
        private String month; // e.g. "04/2026"
        private BigDecimal revenue;
        private BigDecimal debt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentTransaction {
        private Long billId;
        private String roomNumber;
        private String billType;
        private BigDecimal amount;
        private LocalDateTime paymentDate;
        private String paymentReference;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpiringContract {
        private Long contractId;
        private String contractNumber;
        private String roomNumber;
        private String residentName;
        private java.time.LocalDate endDate;
        private long daysRemaining;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueBreakdown {
        private String billType;   // RENT, ELECTRICITY, WATER, SERVICE, OTHER
        private BigDecimal amount;
    }
}
