package com.smartrent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantProfileDTO {
    private String name;
    private String phone;
    private String address;
    private String bankName;
    private String bankAccount;
    private String bankOwner;
    private String bankQrUrl;
}
