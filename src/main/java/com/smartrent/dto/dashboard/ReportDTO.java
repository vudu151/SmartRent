package com.smartrent.dto.dashboard;

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
public class ReportDTO {
    private BigDecimal totalRevenue;
    private List<RevenueByType> revenueByType;
    private List<RevenueByRoom> revenueByRoom;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueByType {
        private String type;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueByRoom {
        private String roomNumber;
        private BigDecimal amount;
    }
}
