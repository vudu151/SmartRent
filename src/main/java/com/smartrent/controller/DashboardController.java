package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.dashboard.DashboardDTO;
import com.smartrent.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for dashboard statistics and analytics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get full dashboard summary including charts and transactions")
    public ResponseEntity<ApiResponse<DashboardDTO>> getSummary(
            @RequestParam Long tenantId,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(tenantId, months));
    }
}
