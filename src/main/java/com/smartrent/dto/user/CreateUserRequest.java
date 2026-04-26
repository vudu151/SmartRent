package com.smartrent.dto.user;

import com.smartrent.domain.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 4, max = 50, message = "Tên đăng nhập phải từ 4 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;

    private String fullName;

    private String phone;

    @NotNull(message = "Vui lòng chọn quyền")
    private UserRole role;
    
    // Optional, if SUPER_ADMIN creates a user for a specific tenant
    private Long tenantId;

    // Optional, if assigning to a specific building
    private Long buildingId;
}
