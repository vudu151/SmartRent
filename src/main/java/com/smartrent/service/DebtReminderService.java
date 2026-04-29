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
    private final EmailService emailService;
    private final InvoiceGeneratorService invoiceGeneratorService;

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

        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        if (tenant == null) return;

        int delayDays = tenant.getReminderDelayDays() != null ? tenant.getReminderDelayDays() : 2;
        int freqDays = tenant.getReminderFrequencyDays() != null ? tenant.getReminderFrequencyDays() : 2;
        java.time.LocalDate today = java.time.LocalDate.now();

        for (Bill bill : unpaidBills) {
            if (bill.getDueDate() == null) continue;

            java.time.LocalDate eligibleReminderDate = bill.getDueDate().plusDays(delayDays);
            
            // Check if it's past the delay
            if (!today.isBefore(eligibleReminderDate)) {
                
                boolean shouldRemind = false;
                if (bill.getLastReminderDate() == null) {
                    shouldRemind = true;
                } else {
                    java.time.LocalDate nextReminderDate = bill.getLastReminderDate().toLocalDate().plusDays(freqDays);
                    if (!today.isBefore(nextReminderDate)) {
                        shouldRemind = true;
                    }
                }

                if (shouldRemind) {
                    sendReminderForBill(bill);
                    bill.setLastReminderDate(java.time.LocalDateTime.now());
                    billRepository.save(bill);
                }
            }
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

        // 1. Send system notification (existing)
        notificationService.sendNotification(
            bill.getTenant().getId(),
            null, // System sender
            title,
            content,
            Notification.NotificationType.BILL.name(),
            recipientIds
        );

        // 2. Generate Excel & Send Email
        try {
            // Find resident to get email
            for (Long residentId : recipientIds) {
                Resident resident = room.getResidents().stream()
                    .filter(r -> r.getId().equals(residentId))
                    .findFirst()
                    .orElse(null);
                    
                if (resident != null && resident.getEmail() != null && !resident.getEmail().isBlank()) {
                    byte[] excelData = invoiceGeneratorService.generateInvoiceExcel(bill, resident.getFullName());
                    String fileName = "Hoa_Don_Phong_" + room.getRoomNumber() + ".xlsx";
                    
                    String htmlBody = content.replace("\n", "<br>");
                    emailService.sendEmailWithAttachment(resident.getEmail(), title, htmlBody, excelData, fileName);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send email reminder for bill {}", bill.getId(), e);
        }
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
