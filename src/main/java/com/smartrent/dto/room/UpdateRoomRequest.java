package com.smartrent.dto.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoomRequest {
    private String roomNumber;
    private Integer floor;
    private BigDecimal area;
    private String type;
    private String status;
    private String description;
    private BigDecimal price;
}
