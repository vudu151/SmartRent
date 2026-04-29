package com.smartrent.dto.tenant;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAutomationSettingsRequest {

    @NotNull(message = "Ngày chốt hóa đơn không được để trống")
    @Min(value = 1, message = "Ngày chốt hóa đơn phải từ 1-28")
    @Max(value = 28, message = "Ngày chốt hóa đơn phải từ 1-28")
    private Integer autoBillingDay;

    @NotNull(message = "Hạn thanh toán không được để trống")
    @Min(value = 1, message = "Hạn thanh toán phải từ 1-28")
    @Max(value = 28, message = "Hạn thanh toán phải từ 1-28")
    private Integer paymentDeadlineDay;

    @NotNull(message = "Số ngày trễ để nhắc không được để trống")
    @Min(value = 1, message = "Số ngày trễ phải lớn hơn 0")
    @Max(value = 30, message = "Số ngày trễ tối đa là 30 ngày")
    private Integer reminderDelayDays;

    @NotNull(message = "Tần suất nhắc không được để trống")
    @Min(value = 1, message = "Tần suất nhắc phải lớn hơn 0")
    @Max(value = 30, message = "Tần suất nhắc tối đa là 30 ngày")
    private Integer reminderFrequencyDays;
}
