package com.smartrent.dto.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomFeeUnitDTO {
    private Long id;
    private Long tenantId;
    private BigDecimal rentPerSqm;
    private BigDecimal servicePerSqm;
    private BigDecimal parkingFee;
    private BigDecimal waterPerUnit;
    private BigDecimal electricityPerUnit;
    private BigDecimal internetFee;
}
