package com.smartrent.controller;

import com.smartrent.domain.Tenant;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.TenantProfileDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.TenantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.smartrent.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant-profile")
@RequiredArgsConstructor
@Tag(name = "Tenant Profile", description = "APIs for managing landlord's personal and banking info")
public class TenantProfileController {

    private final TenantRepository tenantRepository;
    private final EmailService emailService;

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
                .bankQrUrl(tenant.getBankQrUrl())
                .autoBillingDay(tenant.getAutoBillingDay())
                .paymentDeadlineDay(tenant.getPaymentDeadlineDay())
                .reminderDelayDays(tenant.getReminderDelayDays())
                .reminderFrequencyDays(tenant.getReminderFrequencyDays())
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
        if (request.getBankQrUrl() != null) tenant.setBankQrUrl(request.getBankQrUrl());
        if (request.getPhone() != null) tenant.setPhone(request.getPhone());
        if (request.getName() != null) tenant.setName(request.getName());
        if (request.getAddress() != null) tenant.setAddress(request.getAddress());
        
        tenantRepository.save(tenant);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật hồ sơ thành công"));
    }

    @PostMapping("/qr-upload")
    @Operation(summary = "Upload Bank QR Code")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadBankQr(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @org.springframework.beans.factory.annotation.Value("${app.upload.dir:uploads}") String uploadDir) {
        try {
            if (file.isEmpty()) return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION", "File trống"));
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir, "qr");
            java.nio.file.Files.createDirectories(uploadPath);
            String ext = file.getOriginalFilename().contains(".") ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")) : ".jpg";
            String newFilename = "qr_" + java.util.UUID.randomUUID().toString() + ext;
            java.nio.file.Path filePath = uploadPath.resolve(newFilename);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            String qrUrl = "/uploads/qr/" + newFilename;
            return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("qrUrl", qrUrl), "Upload QR thành công"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("UPLOAD_ERROR", "Lỗi: " + e.getMessage()));
        }
    }

    @PostMapping("/test-email")
    @Operation(summary = "Send a test email to verify SMTP configuration")
    public ResponseEntity<ApiResponse<Void>> sendTestEmail(@RequestParam String email) {
        try {
            emailService.sendTestEmail(email);
            return ResponseEntity.ok(ApiResponse.success(null, "Đã gửi email test thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_ERROR", e.getMessage()));
        }
    }
}
