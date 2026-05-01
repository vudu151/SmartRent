package com.smartrent.controller;

import com.smartrent.domain.AuditLog;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.AuditLogDTO;
import com.smartrent.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "APIs for viewing system audit logs")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get audit logs for a tenant")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogs(@RequestParam Long tenantId) {
        List<AuditLog> logs = auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId);
        
        List<AuditLogDTO> dtos = logs.stream().map(log -> AuditLogDTO.builder()
                .id(log.getId())
                .username(log.getUsername())
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos, "Fetched audit logs"));
    }
}
