package com.smartrent.dto.vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {
    private Long id;
    private String licensePlate;
    private String vehicleType;
    private String vehicleTypeName;
    private String brand;
    private String color;
    private List<String> imageUrls;
    private BigDecimal monthlyFee;
    private Long residentId;
    private String residentName;
    private List<String> roomNumbers;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
