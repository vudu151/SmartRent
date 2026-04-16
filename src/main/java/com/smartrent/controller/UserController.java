package com.smartrent.controller;

import com.smartrent.domain.User;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.auth.ChangePasswordRequest;
import com.smartrent.domain.Tenant;
import com.smartrent.dto.user.CreateUserRequest;
import com.smartrent.repository.TenantRepository;
import com.smartrent.repository.UserRepository;
import com.smartrent.repository.ResidentRepository;
import com.smartrent.repository.ContractRepository;
import com.smartrent.domain.Resident;
import com.smartrent.domain.Contract;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for User management (admin + user self-service)
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final ResidentRepository residentRepository;
    private final ContractRepository contractRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping
    @Operation(summary = "Get users", description = "Get paginated list of users")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getUsers(
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        Page<User> users;
        if (tenantId != null) {
            users = userRepository.findByTenantId(tenantId, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        Page<Map<String, Object>> response = users.map(this::toMap);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách user thành công"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsernameOrEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(toMap(user), "Lấy thông tin user thành công"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_MANAGER')")
    @Operation(summary = "Create user", description = "Admin or Manager can create staff/guard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateUserRequest request) {
            
        User currentUser = userRepository.findByUsernameOrEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (userRepository.existsByUsername(request.getUsername())) {
             return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Tên đăng nhập đã tồn tại"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
             return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Email đã tồn tại"));
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setFullName(request.getFullName());
        newUser.setPhone(request.getPhone());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setStatus(User.UserStatus.ACTIVE);

        if (currentUser.getRole() == User.UserRole.TENANT_MANAGER) {
            // Manager can only create GUARD
            if (request.getRole() != User.UserRole.GUARD) {
                return ResponseEntity.status(403).body(ApiResponse.error("FORBIDDEN", "Quản lý chỉ có thể tạo tài khoản Bảo vệ"));
            }
            newUser.setRole(User.UserRole.GUARD);
            newUser.setTenant(currentUser.getTenant());
        } else if (currentUser.getRole() == User.UserRole.SUPER_ADMIN) {
            newUser.setRole(request.getRole());
            if (request.getTenantId() != null) {
                Tenant tenant = tenantRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant không tồn tại"));
                newUser.setTenant(tenant);
            }
        }

        userRepository.save(newUser);
        return ResponseEntity.ok(ApiResponse.success(toMap(newUser), "Tạo tài khoản thành công"));
    }

    @GetMapping("/me/portal")
    @Operation(summary = "Get portal token", description = "Get portal token for the current TENANT user")
    public ResponseEntity<ApiResponse<Map<String, String>>> getMyPortalToken(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsernameOrEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Resident resident = residentRepository.findByEmail(user.getEmail())
                .orElseGet(() -> residentRepository.findByPhone(user.getPhone()).orElse(null));

        if (resident == null) {
            log.error("Portal Token Error: Resident NOT FOUND for email: {} phone: {}", user.getEmail(), user.getPhone());
            return ResponseEntity.badRequest().body(ApiResponse.error("NOT_FOUND", "Không tìm thấy hồ sơ cư dân liên kết với email/số điện thoại này."));
        }

        Contract contract = contractRepository.findActiveContractByResident(resident.getId()).orElse(null);
        if (contract == null) {
            log.error("Portal Token Error: Contract NOT FOUND for resident_id: {}. All contracts for this resident: {}", resident.getId(), contractRepository.findAll().stream().filter(c -> c.getResident().getId().equals(resident.getId())).map(c -> c.getId() + ":" + c.getStatus()).toList());
            return ResponseEntity.badRequest().body(ApiResponse.error("NOT_FOUND", "Bạn chưa có hợp đồng thuê phòng nào đang hiệu lực."));
        }

        log.info("Portal Token Success: Found contract {} for resident {}", contract.getId(), resident.getId());

        Map<String, String> data = new HashMap<>();
        data.put("portalToken", contract.getPortalToken());
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy token thành công"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change current user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByUsernameOrEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Mật khẩu hiện tại không đúng"));
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Mật khẩu xác nhận không khớp"));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công"));
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload avatar", description = "Upload avatar for current user")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = userRepository.findByUsernameOrEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "File không được để trống"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Chỉ chấp nhận file ảnh"));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "File ảnh tối đa 5MB"));
            }

            // Create upload directory
            Path uploadPath = Paths.get(uploadDir, "avatars");
            Files.createDirectories(uploadPath);

            // Delete old avatar if exists
            if (user.getAvatarUrl() != null) {
                try {
                    String oldFileName = user.getAvatarUrl().replace("/uploads/avatars/", "");
                    Path oldFilePath = uploadPath.resolve(oldFileName);
                    Files.deleteIfExists(oldFilePath);
                } catch (Exception e) {
                    log.warn("Could not delete old avatar: {}", e.getMessage());
                }
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
            String newFilename = "avatar_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user avatar URL
            String avatarUrl = "/uploads/avatars/" + newFilename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", avatarUrl);

            return ResponseEntity.ok(ApiResponse.success(result, "Upload avatar thành công"));

        } catch (IOException e) {
            log.error("Avatar upload failed", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("UPLOAD_ERROR", "Upload thất bại: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate user")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Kích hoạt user thành công"));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate user")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        user.setStatus(User.UserStatus.INACTIVE);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Vô hiệu hóa user thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa user thành công"));
    }

    private Map<String, Object> toMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        map.put("phone", user.getPhone() != null ? user.getPhone() : "");
        map.put("role", user.getRole().name());
        map.put("status", user.getStatus().name());
        map.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return map;
    }
}
