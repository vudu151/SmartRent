package com.smartrent.controller;

import com.smartrent.domain.User;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.auth.ChangePasswordRequest;
import com.smartrent.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for User management (admin + user self-service)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "fullName", user.getFullName() != null ? user.getFullName() : "",
            "phone", user.getPhone() != null ? user.getPhone() : "",
            "role", user.getRole().name(),
            "status", user.getStatus().name(),
            "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );
    }
}
