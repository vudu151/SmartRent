package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.resident.CreateResidentRequest;
import com.smartrent.dto.resident.ResidentResponse;
import com.smartrent.dto.resident.UpdateResidentRequest;
import com.smartrent.service.ResidentService;
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

/**
 * Controller for Resident Management
 */
@RestController
@RequestMapping("/api/residents")
@RequiredArgsConstructor
@Tag(name = "Resident Management", description = "APIs for managing residents (cư dân)")
public class ResidentController {

    private final ResidentService residentService;

    @GetMapping
    @Operation(summary = "Get residents", description = "Get paginated list of residents with filters")
    public ResponseEntity<ApiResponse<Page<ResidentResponse>>> getResidents(
            @RequestParam Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(residentService.getResidents(tenantId, status, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resident by ID", description = "Get detailed information of a resident")
    public ResponseEntity<ApiResponse<ResidentResponse>> getResidentById(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(residentService.getResidentById(id, tenantId));
    }

    @PostMapping
    @Operation(summary = "Create resident", description = "Create a new resident")
    public ResponseEntity<ApiResponse<ResidentResponse>> createResident(
            @Valid @RequestBody CreateResidentRequest request) {
        return ResponseEntity.ok(residentService.createResident(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update resident", description = "Update resident information")
    public ResponseEntity<ApiResponse<ResidentResponse>> updateResident(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @Valid @RequestBody UpdateResidentRequest request) {
        return ResponseEntity.ok(residentService.updateResident(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete resident", description = "Delete a resident")
    public ResponseEntity<ApiResponse<Void>> deleteResident(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(residentService.deleteResident(id, tenantId));
    }
}
