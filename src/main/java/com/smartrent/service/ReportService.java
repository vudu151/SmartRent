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
            Bill.BillType type = (Bill.BillType) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            if (amount == null) amount = BigDecimal.ZERO;
            
            revenueByType.add(ReportDTO.RevenueByType.builder()
                    .type(type.name())
                    .amount(amount)
                    .build());
            totalRevenue = totalRevenue.add(amount);
        }

        for (Object[] row : roomData) {
            String roomNumber = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            if (amount == null) amount = BigDecimal.ZERO;
            
            revenueByRoom.add(ReportDTO.RevenueByRoom.builder()
                    .roomNumber(roomNumber != null ? roomNumber : "Khác")
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
}
