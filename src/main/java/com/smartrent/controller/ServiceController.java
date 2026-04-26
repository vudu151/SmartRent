package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.service.MeterReadingDTO;
import com.smartrent.dto.service.RecordMeterRequest;
import com.smartrent.dto.service.BuildingDTO;
import com.smartrent.service.ServiceManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Service Management", description = "APIs for managing rooms services, fee config, and meter readings")
public class ServiceController {

    private final ServiceManagementService serviceManagementService;

    // --- Fee Configurations ---

    @GetMapping("/buildings")
    @Operation(summary = "Get building configurations")
    public ResponseEntity<ApiResponse<BuildingDTO>> getBuildingConfig(
            @RequestParam Long tenantId,
            @RequestParam Long buildingId) {
        return ResponseEntity.ok(serviceManagementService.getBuildingConfig(tenantId, buildingId));
    }

    @PutMapping("/buildings")
    @Operation(summary = "Update building configuration")
    public ResponseEntity<ApiResponse<BuildingDTO>> updateBuildingConfig(
            @RequestParam Long tenantId,
            @RequestParam Long buildingId,
            @Valid @RequestBody BuildingDTO request) {
        return ResponseEntity.ok(serviceManagementService.updateBuildingConfig(tenantId, buildingId, request));
    }

    // --- Meter Readings ---

    @GetMapping("/meters")
    @Operation(summary = "Get meter readings for a specific month")
    public ResponseEntity<ApiResponse<Page<MeterReadingDTO>>> getMeterReadings(
            @RequestParam Long tenantId,
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("room.roomNumber").ascending());
        return ResponseEntity.ok(serviceManagementService.getMeterReadings(tenantId, month, year, search, pageable));
    }

    @PostMapping("/meters")
    @Operation(summary = "Record a new meter index (auto fetch old index)")
    public ResponseEntity<ApiResponse<MeterReadingDTO>> recordMeter(
            @RequestParam Long tenantId,
            @Valid @RequestBody RecordMeterRequest request) {
        return ResponseEntity.ok(serviceManagementService.recordMeter(tenantId, request));
    }

    @PostMapping("/generate-bill")
    @Operation(summary = "Generate a combined bill for a room")
    public ResponseEntity<ApiResponse<Void>> generateCombinedBill(
            @RequestParam Long tenantId,
            @RequestParam Long roomId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(serviceManagementService.generateCombinedBill(tenantId, roomId, month, year));
    }
}
