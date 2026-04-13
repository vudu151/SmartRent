package com.smartrent.dto.bill;

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
public class CreateBillRequest {

    @NotNull(message = "Tenant ID không được để trống")
    private Long tenantId;

    private Long roomId;
    private String roomNumber;

    @NotNull(message = "Loại hóa đơn không được để trống")
    private String billType;

    @NotNull(message = "Số tiền không được để trống")
    private BigDecimal amount;

    private String description;
    private LocalDate dueDate;
}
