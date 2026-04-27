package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.notification.NotificationDTO;
import com.smartrent.dto.notification.SendNotificationRequest;
import com.smartrent.service.DebtReminderService;
import com.smartrent.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "APIs for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final DebtReminderService debtReminderService;
    private final com.smartrent.service.AutoBillingService autoBillingService;

    @GetMapping
    @Operation(summary = "Get notifications")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getNotifications(
            @RequestParam Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getNotifications(tenantId, pageable));
    }

    @PostMapping("/send")
    @Operation(summary = "Send notification")
    public ResponseEntity<ApiResponse<NotificationDTO>> sendNotification(
            @RequestBody SendNotificationRequest request) {
        return ResponseEntity.ok(notificationService.sendNotification(
            request.getTenantId(), 
            request.getSenderId(), 
            request.getTitle(), 
            request.getContent(), 
            request.getType(), 
            request.getRecipientIds()));
    }

    @PostMapping("/remind-unpaid")
    @Operation(summary = "Manual trigger debt reminders for tenant")
    public ResponseEntity<ApiResponse<Void>> remindUnpaidBills(@RequestParam Long tenantId) {
        debtReminderService.remindTenantUnpaidBills(tenantId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã gửi thông báo nhắc nợ thành công"));
    }

    @GetMapping("/system/unread-count")
    @Operation(summary = "Get unread system notifications count for tenant")
    public ResponseEntity<ApiResponse<Long>> getSystemUnreadCount(@RequestParam Long tenantId) {
        return ResponseEntity.ok(notificationService.getSystemUnreadCount(tenantId));
    }

    @GetMapping("/system")
    @Operation(summary = "Get system notifications for tenant")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getSystemNotifications(
            @RequestParam Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(notificationService.getSystemNotifications(tenantId, PageRequest.of(page, size)));
    }

    @PostMapping("/system/mark-all-read")
    @Operation(summary = "Mark all system notifications as read for tenant")
    public ResponseEntity<ApiResponse<Void>> markAllSystemAsRead(@RequestParam Long tenantId) {
        return ResponseEntity.ok(notificationService.markAllSystemAsRead(tenantId));
    }

    // Endpoint dành cho việc test Cronjob
    @PostMapping("/system/trigger-auto-billing")
    @Operation(summary = "Manual trigger auto billing cronjob (for testing)")
    public ResponseEntity<ApiResponse<Void>> triggerAutoBilling(@RequestParam Long tenantId) {
        // Lấy Tenant từ Repository
        // Do không Inject TenantRepository vào đây, ta có thể gọi một hàm mới trong AutoBillingService
        autoBillingService.triggerManualBillingForTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã chạy thủ công cronjob auto billing"));
    }
}
