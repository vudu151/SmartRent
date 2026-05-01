package com.smartrent.aspect;

import com.smartrent.annotation.LogAction;
import com.smartrent.domain.AuditLog;
import com.smartrent.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;

    @AfterReturning(pointcut = "@annotation(logAction)", returning = "result")
    public void logAfter(JoinPoint joinPoint, LogAction logAction, Object result) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return;
            }

            Long tenantId = null;
            String username = "Unknown";

            if (auth.getPrincipal() instanceof com.smartrent.domain.User) {
                com.smartrent.domain.User user = (com.smartrent.domain.User) auth.getPrincipal();
                username = user.getUsername();
                tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
            } else {
                username = auth.getName();
            }

            Long entityId = null;
            String details = "Executed: " + joinPoint.getSignature().getName();

            // Try to extract ID from the returned result object
            if (result != null) {
                try {
                    Object data = result;
                    
                    // Unwrap ResponseEntity
                    if (data instanceof org.springframework.http.ResponseEntity) {
                        data = ((org.springframework.http.ResponseEntity<?>) data).getBody();
                    }
                    
                    // Unwrap ApiResponse
                    if (data != null) {
                        try {
                            java.lang.reflect.Method getDataMethod = data.getClass().getMethod("getData");
                            data = getDataMethod.invoke(data);
                        } catch (Exception ignored) {}
                    }

                    // Extract ID from the actual data object
                    if (data != null) {
                        try {
                            java.lang.reflect.Method getIdMethod = data.getClass().getMethod("getId");
                            Object idValue = getIdMethod.invoke(data);
                            if (idValue instanceof Long) {
                                entityId = (Long) idValue;
                                details += " | ID=" + entityId;
                            } else if (idValue instanceof Integer) {
                                entityId = ((Integer) idValue).longValue();
                                details += " | ID=" + entityId;
                            }
                        } catch (Exception ignored) {
                            // Some DTOs might use getRoomId, getContractId, etc.
                            for (java.lang.reflect.Method m : data.getClass().getMethods()) {
                                if (m.getName().endsWith("Id") && m.getName().startsWith("get") && m.getParameterCount() == 0) {
                                    Object val = m.invoke(data);
                                    if (val instanceof Long) {
                                        entityId = (Long) val;
                                        details += " | " + m.getName().substring(3) + "=" + entityId;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            AuditLog auditLog = AuditLog.builder()
                    .tenantId(tenantId)
                    .username(username)
                    .action(logAction.action())
                    .entityName(logAction.entityName())
                    .entityId(entityId)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Saved audit log: {} {} by {}", logAction.action(), logAction.entityName(), username);
            
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }
}
