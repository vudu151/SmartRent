package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.dashboard.ReportDTO;
import com.smartrent.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "APIs for reporting and analytics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue report", description = "Get aggregated revenue by type and by room")
    public ResponseEntity<ApiResponse<ReportDTO>> getRevenueReport(
            @RequestParam Long tenantId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(reportService.getRevenueReport(tenantId, month, year));
    }
}
