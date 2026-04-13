package com.smartrent.dto.service;

import com.smartrent.domain.MeterType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordMeterRequest {
    
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Meter type is required")
    private MeterType type;

    @NotNull(message = "Reading month is required")
    private Integer readingMonth;

    @NotNull(message = "Reading year is required")
    private Integer readingYear;

    @NotNull(message = "New index is required")
    private BigDecimal newIndex;

    // Notice: oldIndex is not required because we auto-fetch from previous month, 
    // but we can accept it if the user wants to forcefully override it.
    private BigDecimal oldIndex; 
}
