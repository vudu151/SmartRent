package com.smartrent.dto.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    private Long id;
    private Long tenantId;
    private String roomNumber;
    private Integer floor;
    private BigDecimal area;
    private String status;
    private String type;
    private String description;
    private BigDecimal price;
    private java.util.List<String> imageUrls;
    private int residentCount;
    private Set<ResidentSummary> residents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResidentSummary {
        private Long id;
        private String fullName;
        private String phone;
        private String status;
    }
}
