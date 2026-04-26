package com.smartrent.dto.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildingDTO {

    private Long id;
    private Long tenantId;
    private String name;
    private String address;

    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal rentPerSqm;

    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal servicePrice;

    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal parkingPrice;

    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal waterPrice;

    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal electricityPrice;

    @Min(value = 0, message = "Giá không được âm")
    private BigDecimal internetPrice;

    @Min(value = 1, message = "Ngày bắt đầu chốt phải từ 1-31")
    private Integer meterRecordingStartDay;

    @Min(value = 1, message = "Ngày kết thúc chốt phải từ 1-31")
    private Integer meterRecordingEndDay;
}
