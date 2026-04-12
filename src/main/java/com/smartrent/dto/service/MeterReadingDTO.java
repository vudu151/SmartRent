package com.smartrent.dto.service;

import com.smartrent.domain.MeterType;
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
public class MeterReadingDTO {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private MeterType type;
    private Integer readingMonth;
    private Integer readingYear;
    private BigDecimal oldIndex;
    private BigDecimal newIndex;
    private BigDecimal usageAmount; // newIndex - oldIndex
    private LocalDate readingDate;
}
