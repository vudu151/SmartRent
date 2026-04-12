package com.smartrent.dto.resident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentResponse {
    private Long id;
    private Long tenantId;
    private String fullName;
    private String email;
    private String phone;
    private String idCard;
    private LocalDate dateOfBirth;
    private String gender;
    private String status;
    private String notes;
    private Set<RoomSummary> rooms;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomSummary {
        private Long id;
        private String roomNumber;
        private Integer floor;
        private String status;
    }
}
