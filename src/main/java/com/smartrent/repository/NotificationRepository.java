package com.smartrent.repository;

import com.smartrent.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);
    
    // API cho Chủ trọ (System Notifications)
    long countByTenantIdAndTargetTypeAndIsReadFalse(Long tenantId, Notification.TargetType targetType);
    
    Page<Notification> findByTenantIdAndTargetTypeOrderByCreatedAtDesc(Long tenantId, Notification.TargetType targetType, Pageable pageable);
}
