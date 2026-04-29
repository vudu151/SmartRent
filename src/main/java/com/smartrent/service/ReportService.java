package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.dashboard.ReportDTO;
import com.smartrent.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final BillRepository billRepository;

    @Transactional(readOnly = true)
    public ApiResponse<ReportDTO> getRevenueReport(Long tenantId, Integer month, Integer year) {
        LocalDateTime startDate;
        LocalDateTime endDate;

        if (month != null && year != null) {
            YearMonth ym = YearMonth.of(year, month);
            startDate = ym.atDay(1).atStartOfDay();
            endDate = ym.atEndOfMonth().atTime(23, 59, 59);
        } else if (year != null) {
            startDate = LocalDateTime.of(year, 1, 1, 0, 0, 0);
            endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        } else {
            // Default to current month
            YearMonth ym = YearMonth.now();
            startDate = ym.atDay(1).atStartOfDay();
            endDate = ym.atEndOfMonth().atTime(23, 59, 59);
        }

        // Fetch aggregated data
        List<Object[]> typeData = billRepository.sumRevenueByType(tenantId, startDate, endDate);
        List<Object[]> roomData = billRepository.sumRevenueByRoom(tenantId, startDate, endDate);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<ReportDTO.RevenueByType> revenueByType = new ArrayList<>();
        List<ReportDTO.RevenueByRoom> revenueByRoom = new ArrayList<>();

        for (Object[] row : typeData) {
            String typeStr = row[0] instanceof Bill.BillType ? ((Bill.BillType) row[0]).name() : String.valueOf(row[0]);
            BigDecimal amount = getBigDecimal(row[1]);
            
            revenueByType.add(ReportDTO.RevenueByType.builder()
                    .type(typeStr)
                    .amount(amount)
                    .build());
            totalRevenue = totalRevenue.add(amount);
        }

        for (Object[] row : roomData) {
            String roomNumber = row[0] != null ? String.valueOf(row[0]) : "Khác";
            BigDecimal amount = getBigDecimal(row[1]);
            
            revenueByRoom.add(ReportDTO.RevenueByRoom.builder()
                    .roomNumber(roomNumber)
                    .amount(amount)
                    .build());
        }

        ReportDTO report = ReportDTO.builder()
                .totalRevenue(totalRevenue)
                .revenueByType(revenueByType)
                .revenueByRoom(revenueByRoom)
                .build();

        return ApiResponse.success(report, "Fetched report data successfully");
    }

    private BigDecimal getBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }
}
