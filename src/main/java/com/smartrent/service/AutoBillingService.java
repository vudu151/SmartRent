package com.smartrent.service;

import com.smartrent.domain.*;
import com.smartrent.domain.Notification.NotificationType;
import com.smartrent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoBillingService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;
    private final NotificationService notificationService;

    // Chạy lúc 00:00 MỖI NGÀY
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void generateMonthlyBills() {
        log.info("Starting Auto Billing Cronjob (Daily Check)...");
        List<Tenant> tenants = tenantRepository.findAll();
        YearMonth currentMonth = YearMonth.now(); 
        YearMonth billingMonth = currentMonth.minusMonths(1); // Usually bill for the previous month
        int today = LocalDate.now().getDayOfMonth();

        for (Tenant tenant : tenants) {
            int billingDay = tenant.getAutoBillingDay() != null ? tenant.getAutoBillingDay() : 1;
            if (billingDay == today) {
                log.info("Triggering Auto Billing for Tenant {} (Billing Day: {})", tenant.getId(), billingDay);
                processTenantBilling(tenant, billingMonth);
            }
        }
    }

    @Transactional
    public void triggerManualBillingForTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        YearMonth billingMonth = YearMonth.now().minusMonths(1);
        log.info("Manual trigger Auto Billing for Tenant {}", tenantId);
        processTenantBilling(tenant, billingMonth);
    }

    public void processTenantBilling(Tenant tenant, YearMonth billingMonth) {
        List<Room> occupiedRooms = roomRepository.findByTenantIdAndStatus(tenant.getId(), Room.RoomStatus.OCCUPIED);
        int successCount = 0;
        int warningCount = 0;
        List<String> unreadRooms = new ArrayList<>();

        for (Room room : occupiedRooms) {
            Building building = room.getBuilding();
            if (building == null) continue;

            Optional<MeterReading> elecReading = meterReadingRepository.findByRoomAndTypeAndPeriod(
                room.getId(), MeterType.ELECTRICITY, billingMonth.getMonthValue(), billingMonth.getYear());
            
            Optional<MeterReading> waterReading = meterReadingRepository.findByRoomAndTypeAndPeriod(
                room.getId(), MeterType.WATER, billingMonth.getMonthValue(), billingMonth.getYear());

            if (elecReading.isEmpty() || waterReading.isEmpty()) {
                warningCount++;
                unreadRooms.add(room.getRoomNumber());
                continue;
            }

            // Create Electricity Bill
            createUtilityBill(tenant, room, building.getElectricityPrice(), elecReading.get(), Bill.BillType.ELECTRICITY);
            
            // Create Water Bill
            createUtilityBill(tenant, room, building.getWaterPrice(), waterReading.get(), Bill.BillType.WATER);
            
            // Create Rent Bill (Room Price)
            createRentBill(tenant, room);
            
            successCount++;
        }

        if (successCount > 0) {
            String title = "Thành công: Tự động tạo " + (successCount * 3) + " Hóa đơn"; // 3 bills per room
            String content = String.format("Hệ thống đã tự động tạo hóa đơn cho %d phòng (Kỳ %02d/%d). Vui lòng kiểm tra màn hình Hóa đơn.", 
                                           successCount, billingMonth.getMonthValue(), billingMonth.getYear());
            notificationService.createSystemNotification(tenant, title, content, NotificationType.SYSTEM_SUCCESS);
        }

        if (warningCount > 0) {
            String title = "Cảnh báo: " + warningCount + " phòng chưa chốt số điện nước";
            String content = String.format("Phòng %s chưa có số liệu điện nước kỳ %02d/%d. Hệ thống không thể tự động tạo hóa đơn. Vui lòng cập nhật số liệu và tạo thủ công.", 
                                           String.join(", ", unreadRooms), billingMonth.getMonthValue(), billingMonth.getYear());
            notificationService.createSystemNotification(tenant, title, content, NotificationType.SYSTEM_WARNING);
        }
    }

    private void createUtilityBill(Tenant tenant, Room room, BigDecimal price, MeterReading reading, Bill.BillType type) {
        BigDecimal consumed = reading.getNewIndex().subtract(reading.getOldIndex());
        if (consumed.compareTo(BigDecimal.ZERO) <= 0) return;

        int deadlineDay = tenant.getPaymentDeadlineDay() != null ? tenant.getPaymentDeadlineDay() : 5;
        LocalDate dueDate = LocalDate.now().withDayOfMonth(deadlineDay);
        if (dueDate.isBefore(LocalDate.now())) {
            dueDate = dueDate.plusMonths(1);
        }

        BigDecimal amount = price.multiply(consumed);
        String unit = type == Bill.BillType.ELECTRICITY ? "kWh" : "khối";
        String description = String.format("Tiêu thụ %s: %s %s (Từ %s -> %s).", 
                type == Bill.BillType.ELECTRICITY ? "điện" : "nước",
                consumed.toString(), unit, reading.getOldIndex().toString(), reading.getNewIndex().toString());

        Bill bill = Bill.builder()
            .tenant(tenant)
            .room(room)
            .roomNumber(room.getRoomNumber())
            .billType(type)
            .amount(amount)
            .dueDate(dueDate)
            .status(Bill.BillStatus.UNPAID)
            .description(description)
            .build();
        billRepository.save(bill);
    }

    private void createRentBill(Tenant tenant, Room room) {
        if (room.getPrice() == null || room.getPrice().compareTo(BigDecimal.ZERO) <= 0) return;

        int deadlineDay = tenant.getPaymentDeadlineDay() != null ? tenant.getPaymentDeadlineDay() : 5;
        LocalDate dueDate = LocalDate.now().withDayOfMonth(deadlineDay);
        if (dueDate.isBefore(LocalDate.now())) {
            dueDate = dueDate.plusMonths(1);
        }

        Bill bill = Bill.builder()
            .tenant(tenant)
            .room(room)
            .roomNumber(room.getRoomNumber())
            .billType(Bill.BillType.RENT)
            .amount(room.getPrice())
            .dueDate(dueDate)
            .status(Bill.BillStatus.UNPAID)
            .description("Tiền thuê phòng tháng này.")
            .build();
        billRepository.save(bill);
    }
}
