package com.smartrent.dto.resident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateResidentRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private String email;
    private String phone;
    private String idCard;
    private LocalDate dateOfBirth;
    private String gender;
    private String notes;
    private Set<Long> roomIds;

    @NotNull(message = "Tenant ID không được để trống")
    private Long tenantId;
}
