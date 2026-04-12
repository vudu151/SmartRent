package com.smartrent.dto.asset;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RoomAssetDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long roomId;
        private String name;
        private Integer quantity;
        private String condition;
        private BigDecimal compensationValue;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long roomId;
        private String roomNumber;
        private String name;
        private Integer quantity;
        private String condition;
        private BigDecimal compensationValue;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
