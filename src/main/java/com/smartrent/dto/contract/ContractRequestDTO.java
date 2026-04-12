package com.smartrent.dto.contract;

import com.smartrent.domain.ContractStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequestDTO {

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Resident ID is required")
    private Long residentId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Monthly rent is required")
    private BigDecimal monthlyRent;

    @NotNull(message = "Deposit amount is required")
    private BigDecimal depositAmount;

    @Builder.Default
    private ContractStatus status = ContractStatus.ACTIVE;

    private String notes;
}
