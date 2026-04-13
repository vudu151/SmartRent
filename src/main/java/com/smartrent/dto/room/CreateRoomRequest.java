package com.smartrent.dto.room;

import jakarta.validation.constraints.NotBlank;
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
public class CreateRoomRequest {

    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    private Integer floor;

    private BigDecimal area;

    private String type; // STANDARD, KIOT, PENTHOUSE

    private String description;

    private BigDecimal price;

    @NotNull(message = "Tenant ID không được để trống")
    private Long tenantId;
}
