package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.tenant.CreateTenantRequest;
import com.smartrent.dto.tenant.TenantResponse;
import com.smartrent.dto.tenant.UpdateTenantRequest;
import com.smartrent.domain.Tenant;
import com.smartrent.service.TenantService;
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
 * Controller for Tenant Management
 */
@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenant Management", description = "APIs for managing tenants (chủ trọ)")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Get all tenants", description = "Get paginated list of all tenants with optional search")
    public ResponseEntity<ApiResponse<Page<TenantResponse>>> getAllTenants(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        ApiResponse<Page<TenantResponse>> response = tenantService.getAllTenants(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tenant by ID", description = "Get detailed information of a tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantById(@PathVariable Long id) {
        ApiResponse<TenantResponse> response = tenantService.getTenantById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create new tenant", description = "Create a new tenant (chủ trọ)")
    public ResponseEntity<ApiResponse<TenantResponse>> createTenant(
            @Valid @RequestBody CreateTenantRequest request) {
        ApiResponse<TenantResponse> response = tenantService.createTenant(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tenant", description = "Update tenant information")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTenantRequest request) {
        ApiResponse<TenantResponse> response = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tenant", description = "Soft delete tenant by setting status to CANCELLED")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable Long id) {
        ApiResponse<Void> response = tenantService.deleteTenant(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update tenant status", description = "Update tenant status (ACTIVE, SUSPENDED, CANCELLED)")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenantStatus(
            @PathVariable Long id,
            @RequestParam Tenant.TenantStatus status) {
        ApiResponse<TenantResponse> response = tenantService.updateTenantStatus(id, status);
        return ResponseEntity.ok(response);
    }
}
