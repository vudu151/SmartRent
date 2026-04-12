package com.smartrent.service;

import com.smartrent.domain.Notification;
import com.smartrent.domain.Resident;
import com.smartrent.domain.Tenant;
import com.smartrent.domain.User;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.notification.NotificationDTO;
import com.smartrent.repository.NotificationRepository;
import com.smartrent.repository.ResidentRepository;
import com.smartrent.repository.TenantRepository;
import com.smartrent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ResidentRepository residentRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ApiResponse<Page<NotificationDTO>> getNotifications(Long tenantId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        Page<NotificationDTO> response = notifications.map(this::toDTO);
        return ApiResponse.success(response, "Lấy danh sách thông báo thành công");
    }

    @Transactional
    public ApiResponse<NotificationDTO> sendNotification(Long tenantId, Long senderId,
                                                               String title, String content,
                                                               String type, List<Long> recipientIds) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new RuntimeException("Tenant không tồn tại"));

        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId).orElse(null);
        }

        Notification.NotificationType notifType = type != null
            ? Notification.NotificationType.valueOf(type)
            : Notification.NotificationType.GENERAL;

        Notification notification = Notification.builder()
            .tenant(tenant)
            .title(title)
            .content(content)
            .type(notifType)
            .sender(sender)
            .build();

        if (recipientIds != null && !recipientIds.isEmpty()) {
            notification.setTargetType(Notification.TargetType.SPECIFIC);
            Set<Resident> recipients = new HashSet<>();
            for (Long residentId : recipientIds) {
                residentRepository.findByIdAndTenantId(residentId, tenantId)
                    .ifPresent(recipients::add);
            }
            notification.setRecipients(recipients);
        } else {
            notification.setTargetType(Notification.TargetType.ALL);
        }

        notification = notificationRepository.save(notification);
        log.info("Sent notification '{}' for tenant {}", title, tenantId);
        return ApiResponse.success(toDTO(notification), "Gửi thông báo thành công");
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
            .id(n.getId())
            .title(n.getTitle())
            .content(n.getContent())
            .type(n.getType().name())
            .targetType(n.getTargetType().name())
            .senderName(n.getSender() != null ? n.getSender().getFullName() : "Hệ thống")
            .isRead(n.getIsRead())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
