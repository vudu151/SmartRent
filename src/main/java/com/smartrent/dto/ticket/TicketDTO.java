package com.smartrent.dto.ticket;

import com.smartrent.domain.Ticket.TicketCategory;
import com.smartrent.domain.Ticket.TicketPriority;
import com.smartrent.domain.Ticket.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class TicketDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String title;
        private String description;
        private TicketStatus status;
        private TicketPriority priority;
        private TicketCategory category;
        private Long roomId;     // Required when Admin creates it
        private Long residentId; // Required when Admin creates it
        private List<String> imageUrls;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private TicketStatus status;
        private TicketPriority priority;
        private TicketCategory category;
        
        private Long roomId;
        private String roomNumber;
        
        private Long residentId;
        private String residentName;
        private String residentPhone;

        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<String> imageUrls;
    }
}
