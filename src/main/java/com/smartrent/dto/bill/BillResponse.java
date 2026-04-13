package com.smartrent.dto.bill;

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
public class BillResponse {
    private Long id;
    private Long tenantId;
    private Long roomId;
    private String roomNumber;
    private String billType;
    private BigDecimal amount;
    private String description;
    private LocalDate dueDate;
    private String status;
    private LocalDateTime paymentDate;
    private String paymentReference;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
