package com.smartrent.security;

import com.smartrent.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Aspect to globally enforce tenant-level data isolation.
 * Prevents a TENANT_MANAGER or GUARD from accessing or modifying 
 * data belonging to another tenantId.
 */
@Aspect
@Component
@Slf4j
public class TenantSecurityAspect {

    @Before("execution(* com.smartrent.controller..*(..))")
    public void validateTenantAccess(JoinPoint joinPoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;

        if (auth.getPrincipal() instanceof User user) {
            // SUPER_ADMIN has global access, bypass check
            if (user.getRole() == User.UserRole.SUPER_ADMIN) return;

            Long userTenantId = user.getTenant() != null ? user.getTenant().getId() : null;
            if (userTenantId == null) return;

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String[] paramNames = signature.getParameterNames();
            Object[] args = joinPoint.getArgs();

            for (int i = 0; i < args.length; i++) {
                Object arg = args[i];
                if (arg == null) continue;

                Long requestedTenantId = null;

                // 1. Direct @RequestParam named "tenantId"
                if (paramNames != null && i < paramNames.length && "tenantId".equals(paramNames[i]) && arg instanceof Long) {
                    requestedTenantId = (Long) arg;
                }
                // 2. Extracted via getter (e.g. DTOs with getTenantId() method)
                else {
                    try {
                        Method getTenantIdMethod = arg.getClass().getMethod("getTenantId");
                        Object val = getTenantIdMethod.invoke(arg);
                        if (val instanceof Long) {
                            requestedTenantId = (Long) val;
                        }
                    } catch (Exception ignored) {
                        // Method does not exist or invocation failed, skip
                    }
                }

                // Validation Guard
                if (requestedTenantId != null && !requestedTenantId.equals(userTenantId)) {
                    log.warn("Security Alert: User {} (Role: {}) attempted to access tenantId {} but owns tenantId {}",
                            user.getUsername(), user.getRole(), requestedTenantId, userTenantId);
                    throw new AccessDeniedException("Bạn không có quyền thao tác trên dữ liệu của khu nhà trọ khác (Mã lỗi: TENANT_MISMATCH).");
                }
            }
        }
    }
}
