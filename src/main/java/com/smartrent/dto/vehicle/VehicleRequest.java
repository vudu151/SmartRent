package com.smartrent.dto.vehicle;

import com.smartrent.domain.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequest {

    @NotBlank(message = "Biển số xe không được để trống")
    private String licensePlate;

    @NotNull(message = "Loại xe không được để trống")
    private VehicleType vehicleType;

    private String brand;

    private String color;

    private List<String> imageUrls;

    private BigDecimal monthlyFee;

    @NotNull(message = "Cư dân không được để trống")
    private Long residentId;

    private String notes;
}
