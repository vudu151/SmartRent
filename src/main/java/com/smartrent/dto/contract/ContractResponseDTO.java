package com.smartrent.dto.contract;

import com.smartrent.domain.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponseDTO {
    private Long id;
    private String contractNumber;
    private Long tenantId;
    private Long roomId;
    private String roomNumber;
    private Long residentId;
    private String residentName;
    private String residentPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyRent;
    private BigDecimal depositAmount;
    private ContractStatus status;
    private String notes;
    private String portalToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
