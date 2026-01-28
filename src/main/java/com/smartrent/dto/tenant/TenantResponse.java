package com.smartrent.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for tenant response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String taxCode;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
