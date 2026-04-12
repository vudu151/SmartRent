package com.smartrent.dto.bill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MeterReadingRequestDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchRequest {
        @NotNull(message = "Danh sách chốt số không được trống")
        private List<ReadingItem> readings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReadingItem {
        @NotNull
        private Long roomId;
        
        private Integer oldElectricity;
        private Integer newElectricity;
        
        private Integer oldWater;
        private Integer newWater;
    }
}
