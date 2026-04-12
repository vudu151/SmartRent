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
}
