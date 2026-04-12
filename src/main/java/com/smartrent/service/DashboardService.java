package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.domain.Contract;
import com.smartrent.domain.Room;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.dashboard.DashboardDTO;
import com.smartrent.repository.BillRepository;
import com.smartrent.repository.ContractRepository;
import com.smartrent.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RoomRepository roomRepository;
    private final BillRepository billRepository;
    private final ContractRepository contractRepository;

    @Transactional(readOnly = true)
    public ApiResponse<DashboardDTO> getDashboardSummary(Long tenantId, int months) {
        // 1. Summary Cards
        int totalRooms = roomRepository.findByTenantId(tenantId).size();
        int occupiedRooms = (int) roomRepository.countByTenantIdAndStatus(tenantId, Room.RoomStatus.OCCUPIED);
        int vacantRooms = (int) roomRepository.countByTenantIdAndStatus(tenantId, Room.RoomStatus.VACANT);

        LocalDate now = LocalDate.now();
        LocalDate startOfCurrentMonth = now.withDayOfMonth(1);
        LocalDate endOfCurrentMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<Bill> currentMonthBills = billRepository.findByTenantIdAndDateRange(tenantId, startOfCurrentMonth, endOfCurrentMonth);
        BigDecimal currentMonthRevenue = currentMonthBills.stream()
                .filter(b -> b.getStatus() == Bill.BillStatus.PAID)
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Bill.BillStatus> debtStatuses = List.of(Bill.BillStatus.UNPAID, Bill.BillStatus.OVERDUE);
        List<Bill> debtBills = billRepository.findByTenantIdAndStatusIn(tenantId, debtStatuses);
        BigDecimal totalDebt = debtBills.stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Check expiring contracts (in next 30 days)
        LocalDate thirtyDaysLater = now.plusDays(30);
        List<Contract> contracts = contractRepository.findByTenantId(tenantId, "", PageRequest.of(0, 1000)).getContent(); // Assuming a small scale for demo. Proper way is a custom query
        int expiringContracts = (int) contracts.stream()
                .filter(c -> c.getStatus().equals("ACTIVE") && c.getEndDate() != null && !c.getEndDate().isAfter(thirtyDaysLater))
                .count();

        DashboardDTO.Summary summary = DashboardDTO.Summary.builder()
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .vacantRooms(vacantRooms)
                .currentMonthRevenue(currentMonthRevenue)
                .totalDebt(totalDebt)
                .expiringContracts(expiringContracts)
                .build();

        // 2. Chart Data (Last N months)
        List<DashboardDTO.ChartData> chartDataList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");

        for (int i = months - 1; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            LocalDate start = targetDate.withDayOfMonth(1);
            LocalDate end = targetDate.withDayOfMonth(targetDate.lengthOfMonth());

            List<Bill> monthlyBills = billRepository.findByTenantIdAndDateRange(tenantId, start, end);
            BigDecimal monthlyRevenue = monthlyBills.stream()
                    .filter(b -> b.getStatus() == Bill.BillStatus.PAID)
                    .map(Bill::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal monthlyDebt = monthlyBills.stream()
                    .filter(b -> debtStatuses.contains(b.getStatus()))
                    .map(Bill::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            chartDataList.add(DashboardDTO.ChartData.builder()
                    .month(targetDate.format(formatter))
                    .revenue(monthlyRevenue)
                    .debt(monthlyDebt)
                    .build());
        }

        // 3. Recent Transactions
        List<Bill> paidBills = billRepository.findTop10ByTenantIdAndStatusOrderByPaymentDateDesc(tenantId, Bill.BillStatus.PAID);
        List<DashboardDTO.RecentTransaction> recentTransactions = paidBills.stream()
                .limit(10)
                .map(b -> DashboardDTO.RecentTransaction.builder()
                        .billId(b.getId())
                        .roomNumber(b.getRoomNumber() != null ? b.getRoomNumber() : "Khác")
                        .billType(b.getBillType().name())
                        .amount(b.getAmount())
                        .paymentDate(b.getPaymentDate() != null ? b.getPaymentDate() : b.getUpdatedAt())
                        .paymentReference(b.getPaymentReference())
                        .build())
                .collect(Collectors.toList());

        DashboardDTO dashboardDTO = DashboardDTO.builder()
                .summary(summary)
                .chartData(chartDataList)
                .recentTransactions(recentTransactions)
                .build();

        return ApiResponse.success(dashboardDTO, "Lấy dữ liệu Dashboard thành công");
    }
}
