package com.smartrent.repository;

import com.smartrent.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);
}
