package com.smartrent.service;

import com.smartrent.domain.Bill;
import com.smartrent.domain.Contract;
import com.smartrent.domain.ContractStatus;
import com.smartrent.domain.Room;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.dashboard.DashboardDTO;
import com.smartrent.repository.BillRepository;
import com.smartrent.repository.ContractRepository;
import com.smartrent.repository.RoomRepository;
import com.smartrent.repository.TicketRepository;
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
    private final TicketRepository ticketRepository;

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
        
        List<Contract> expiringList = contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE && c.getEndDate() != null && !c.getEndDate().isAfter(thirtyDaysLater))
                .sorted((a, b) -> a.getEndDate().compareTo(b.getEndDate()))
                .limit(5)
                .collect(Collectors.toList());

        int expiringContracts = expiringList.size();

        List<DashboardDTO.ExpiringContract> expiringContractsList = expiringList.stream()
                .map(c -> DashboardDTO.ExpiringContract.builder()
                        .contractId(c.getId())
                        .contractNumber(c.getContractNumber())
                        .roomNumber(c.getRoom() != null ? c.getRoom().getRoomNumber() : "N/A")
                        .residentName(c.getResident() != null ? c.getResident().getFullName() : "N/A")
                        .endDate(c.getEndDate())
                        .daysRemaining(java.time.temporal.ChronoUnit.DAYS.between(now, c.getEndDate()))
                        .build())
                .collect(Collectors.toList());

        int maintenanceRooms = (int) roomRepository.countByTenantIdAndStatus(tenantId, Room.RoomStatus.MAINTENANCE);
        long pendingTickets = ticketRepository.countPendingTicketsByTenantId(tenantId);

        DashboardDTO.Summary summary = DashboardDTO.Summary.builder()
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .vacantRooms(vacantRooms)
                .maintenanceRooms(maintenanceRooms)
                .currentMonthRevenue(currentMonthRevenue)
                .totalDebt(totalDebt)
                .expiringContracts(expiringContracts)
                .pendingTickets(pendingTickets)
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

        // 4. Revenue Breakdown by Bill Type (all-time PAID bills)
        List<Bill> allPaidBills = billRepository.findByTenantIdAndStatusIn(tenantId, List.of(Bill.BillStatus.PAID));
        Map<String, BigDecimal> revenueByType = allPaidBills.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getBillType().name(),
                        Collectors.reducing(BigDecimal.ZERO, Bill::getAmount, BigDecimal::add)
                ));
        List<DashboardDTO.RevenueBreakdown> revenueBreakdown = revenueByType.entrySet().stream()
                .map(e -> DashboardDTO.RevenueBreakdown.builder()
                        .billType(e.getKey())
                        .amount(e.getValue())
                        .build())
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        DashboardDTO dashboardDTO = DashboardDTO.builder()
                .summary(summary)
                .chartData(chartDataList)
                .recentTransactions(recentTransactions)
                .expiringContractsList(expiringContractsList)
                .revenueBreakdown(revenueBreakdown)
                .build();

        return ApiResponse.success(dashboardDTO, "Lấy dữ liệu Dashboard thành công");
    }
}
