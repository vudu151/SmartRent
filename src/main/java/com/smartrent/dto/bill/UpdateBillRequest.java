package com.smartrent.dto.bill;

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
public class UpdateBillRequest {
    private String billType;
    private BigDecimal amount;
    private String description;
    private LocalDate dueDate;
    private String status;
    private String paymentReference;
}
