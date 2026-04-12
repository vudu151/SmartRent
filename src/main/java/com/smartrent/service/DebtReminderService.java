package com.smartrent.service;

import com.smartrent.domain.*;
import com.smartrent.repository.BillRepository;
import com.smartrent.repository.ContractRepository;
import com.smartrent.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DebtReminderService {

    private final BillRepository billRepository;
    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final NotificationService notificationService;

    /**
     * Cron job runs every day at 8:00 PM (20:00)
     */
    @Scheduled(cron = "0 0 20 * * *")
    @Transactional
    public void scheduleDailyDebtReminders() {
        log.info("Starting scheduled daily debt reminders at 20:00");
        List<Tenant> tenants = tenantRepository.findAll();
        for (Tenant tenant : tenants) {
            try {
                remindTenantUnpaidBills(tenant.getId());
            } catch (Exception e) {
                log.error("Error reminding tenant {}: {}", tenant.getId(), e.getMessage());
            }
        }
        log.info("Finished scheduled daily debt reminders");
    }

    @Transactional
    public void remindTenantUnpaidBills(Long tenantId) {
        // Find unpaid or overdue bills for this tenant
        List<Bill.BillStatus> statuses = List.of(Bill.BillStatus.UNPAID, Bill.BillStatus.OVERDUE);
        List<Bill> unpaidBills = billRepository.findByTenantIdAndStatusIn(tenantId, statuses);

        if (unpaidBills.isEmpty()) {
            return;
        }

        for (Bill bill : unpaidBills) {
            sendReminderForBill(bill);
        }
    }

    private void sendReminderForBill(Bill bill) {
        Room room = bill.getRoom();
        if (room == null) return;

        // 1. Find the main resident (contract holder)
        List<Long> recipientIds;
        var activeContract = contractRepository.findActiveContractByRoom(room.getId());
        
        if (activeContract.isPresent()) {
            recipientIds = List.of(activeContract.get().getResident().getId());
        } else {
            // 2. Fallback: all active residents in the room
            recipientIds = room.getResidents().stream()
                .filter(r -> r.getStatus() == Resident.ResidentStatus.ACTIVE)
                .map(Resident::getId)
                .collect(Collectors.toList());
        }

        if (recipientIds.isEmpty()) return;

        String billTypeLabel = getBillTypeLabel(bill.getBillType());
        String dueDateStr = bill.getDueDate() != null 
            ? bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) 
            : "N/A";

        String title = "🔔 Nhắc nợ: Hóa đơn " + billTypeLabel + " phòng " + room.getRoomNumber();
        String content = String.format(
            "Chào bạn, hệ thống SmartRent xin nhắc bạn về hóa đơn %s của phòng %s.\n\n" +
            "• Số tiền: %,.0f VNĐ\n" +
            "• Hạn thanh toán: %s\n" +
            "• Nội dung: %s\n\n" +
            "Vui lòng thanh toán sớm để đảm bảo quyền lợi của bạn. Xin cảm ơn!",
            billTypeLabel,
            room.getRoomNumber(),
            bill.getAmount(),
            dueDateStr,
            bill.getDescription() != null ? bill.getDescription() : "Không có ghi chú"
        );

        notificationService.sendNotification(
            bill.getTenant().getId(),
            null, // System sender
            title,
            content,
            Notification.NotificationType.BILL.name(),
            recipientIds
        );
    }

    private String getBillTypeLabel(Bill.BillType type) {
        if (type == null) return "Khác";
        return switch (type) {
            case RENT -> "Tiền thuê phòng";
            case ELECTRICITY -> "Tiền điện";
            case WATER -> "Tiền nước";
            case SERVICE -> "Phí dịch vụ";
            case PARKING -> "Phí giữ xe";
            case INTERNET -> "Phí internet";
            default -> "Chi phí khác";
        };
    }
}
