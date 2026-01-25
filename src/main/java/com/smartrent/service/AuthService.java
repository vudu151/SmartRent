package com.smartrent.service;

import com.smartrent.domain.Tenant;
import com.smartrent.domain.User;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.auth.LoginRequest;
import com.smartrent.dto.auth.LoginResponse;
import com.smartrent.dto.auth.RefreshTokenRequest;
import com.smartrent.dto.auth.SignUpRequest;
import com.smartrent.repository.RoleRepository;
import com.smartrent.repository.TenantRepository;
import com.smartrent.repository.UserRepository;
import com.smartrent.security.CustomUserDetailsService;
import com.smartrent.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Authentication Service
 * Handles login, logout, and token refresh
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticate user and generate JWT tokens
     */
    @Transactional
    public ApiResponse<LoginResponse> login(LoginRequest request) {
        try {
            // Check if user exists first
            User user = userRepository.findByUsernameOrEmail(request.getUsername())
                .orElse(null);
            
            if (user == null) {
                return ApiResponse.error("AUTH_ERROR", "Tài khoản không tồn tại. Vui lòng kiểm tra lại tên đăng nhập hoặc email.");
            }

            // Check if user is active
            if (!user.isEnabled()) {
                return ApiResponse.error("AUTH_ERROR", "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
            }

            // Authenticate user (this will check password)
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                    )
                );
            } catch (BadCredentialsException e) {
                return ApiResponse.error("AUTH_ERROR", "Mật khẩu không đúng. Vui lòng thử lại.");
            }

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

            // Generate tokens
            Long tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
            String accessToken = tokenProvider.generateAccessToken(userDetails, user.getId(), tenantId);
            String refreshToken = tokenProvider.generateRefreshToken(userDetails, user.getId(), tenantId);

            // Update last login
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            // Build response
            LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpiration() / 1000) // Convert to seconds
                .user(LoginResponse.UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .tenantId(tenantId)
                    .role(user.getRole().name())
                    .permissions(user.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                        .collect(Collectors.toSet()))
                    .build())
                .build();

            return ApiResponse.success(response, "Login successful");

        } catch (BadCredentialsException e) {
            return ApiResponse.error("AUTH_ERROR", "Mật khẩu không đúng. Vui lòng thử lại.");
        } catch (Exception e) {
            return ApiResponse.error("AUTH_ERROR", "Đăng nhập thất bại: " + e.getMessage());
        }
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional(readOnly = true)
    public ApiResponse<LoginResponse> refreshToken(RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();

            // Validate refresh token
            if (!tokenProvider.isRefreshToken(refreshToken)) {
                return ApiResponse.error("AUTH_ERROR", "Invalid refresh token");
            }

            if (tokenProvider.isTokenExpired(refreshToken)) {
                return ApiResponse.error("AUTH_ERROR", "Refresh token has expired");
            }

            // Get user from token
            String username = tokenProvider.getUsernameFromToken(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

            // Generate new access token
            Long tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
            String newAccessToken = tokenProvider.generateAccessToken(userDetails, user.getId(), tenantId);

            // Build response
            LoginResponse response = LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Keep the same refresh token
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpiration() / 1000)
                .user(LoginResponse.UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .tenantId(tenantId)
                    .role(user.getRole().name())
                    .permissions(user.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                        .collect(Collectors.toSet()))
                    .build())
                .build();

            return ApiResponse.success(response, "Token refreshed successfully");

        } catch (Exception e) {
            return ApiResponse.error("AUTH_ERROR", "Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Register new user
     */
    @Transactional
    public ApiResponse<LoginResponse> register(SignUpRequest request) {
        try {
            // Validate passwords match
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return ApiResponse.error("VALIDATION_ERROR", "Mật khẩu xác nhận không khớp.");
            }

            // Check if email already exists
            if (userRepository.findByUsernameOrEmail(request.getEmail()).isPresent()) {
                return ApiResponse.error("VALIDATION_ERROR", "Email đã được sử dụng. Vui lòng sử dụng email khác.");
            }

            // Generate username from email (part before @)
            String username = request.getEmail().split("@")[0];
            // Ensure username is unique
            int counter = 1;
            String originalUsername = username;
            while (userRepository.findByUsernameOrEmail(username).isPresent()) {
                username = originalUsername + counter;
                counter++;
            }

            // Create or find tenant for the user
            Tenant tenant = tenantRepository.findByEmail(request.getEmail())
                .orElse(null);
            
            if (tenant == null) {
                // Create new tenant for the user
                tenant = Tenant.builder()
                    .name(request.getFullName() != null ? request.getFullName() : username)
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .status(Tenant.TenantStatus.ACTIVE)
                    .build();
                tenant = tenantRepository.save(tenant);
            }

            // Hash password
            String passwordHash = passwordEncoder.encode(request.getPassword());

            // Create new user
            User newUser = User.builder()
                .tenant(tenant)
                .username(username)
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(User.UserRole.TENANT)
                .status(User.UserStatus.ACTIVE)
                .build();

            newUser = userRepository.save(newUser);

            // Assign TENANT_STAFF role to user
            final User savedUser = newUser;
            roleRepository.findByName("TENANT_STAFF").ifPresent(role -> {
                savedUser.addRole(role);
                userRepository.save(savedUser);
            });

            // Reload user to get roles
            User finalUser = userRepository.findById(savedUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found after creation"));

            // Auto login after registration
            UserDetails userDetails = userDetailsService.loadUserByUsername(finalUser.getUsername());
            Long tenantId = finalUser.getTenant() != null ? finalUser.getTenant().getId() : null;
            String accessToken = tokenProvider.generateAccessToken(userDetails, finalUser.getId(), tenantId);
            String refreshToken = tokenProvider.generateRefreshToken(userDetails, finalUser.getId(), tenantId);

            // Build response
            LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpiration() / 1000)
                .user(LoginResponse.UserInfo.builder()
                    .id(finalUser.getId())
                    .username(finalUser.getUsername())
                    .email(finalUser.getEmail())
                    .fullName(finalUser.getFullName())
                    .tenantId(tenantId)
                    .role(finalUser.getRole().name())
                    .permissions(finalUser.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                        .collect(Collectors.toSet()))
                    .build())
                .build();

            return ApiResponse.success(response, "Đăng ký thành công!");

        } catch (Exception e) {
            return ApiResponse.error("REGISTRATION_ERROR", "Đăng ký thất bại: " + e.getMessage());
        }
    }

    /**
     * Logout (client-side should remove tokens)
     * In a more advanced implementation, we could maintain a token blacklist
     */
    public ApiResponse<Void> logout() {
        // In a stateless JWT implementation, logout is handled client-side
        // For enhanced security, consider implementing token blacklisting with Redis
        return ApiResponse.success(null, "Logout successful");
    }
}
