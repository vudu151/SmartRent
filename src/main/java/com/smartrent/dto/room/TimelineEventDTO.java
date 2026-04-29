package com.smartrent.dto.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventDTO {
    private String id;
    private String type; // BILL, TICKET, CONTRACT, RESIDENT, ROOM
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private String status;
    private String color;
}
