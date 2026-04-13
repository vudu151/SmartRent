package com.smartrent.controller;

import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.TenantProfileDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.TenantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant-profile")
@RequiredArgsConstructor
@Tag(name = "Tenant Profile", description = "APIs for managing landlord's personal and banking info")
public class TenantProfileController {

    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "Get tenant profile including bank configuration")
    public ResponseEntity<ApiResponse<TenantProfileDTO>> getProfile(@RequestParam Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Chủ trọ không tồn tại"));

        TenantProfileDTO dto = TenantProfileDTO.builder()
                .name(tenant.getName())
                .phone(tenant.getPhone())
                .address(tenant.getAddress())
                .bankName(tenant.getBankName())
                .bankAccount(tenant.getBankAccount())
                .bankOwner(tenant.getBankOwner())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy hồ sơ thành công"));
    }

    @PutMapping
    @Operation(summary = "Update tenant partial profile (Banking Configs)")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @RequestParam Long tenantId,
            @RequestBody TenantProfileDTO request) {
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Chủ trọ không tồn tại"));

        if (request.getBankName() != null) tenant.setBankName(request.getBankName());
        if (request.getBankAccount() != null) tenant.setBankAccount(request.getBankAccount());
        if (request.getBankOwner() != null) tenant.setBankOwner(request.getBankOwner());
        if (request.getPhone() != null) tenant.setPhone(request.getPhone());
        if (request.getName() != null) tenant.setName(request.getName());
        if (request.getAddress() != null) tenant.setAddress(request.getAddress());
        
        tenantRepository.save(tenant);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật hồ sơ thành công"));
    }
}
