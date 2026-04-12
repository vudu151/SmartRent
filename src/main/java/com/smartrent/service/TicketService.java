package com.smartrent.service;

import com.smartrent.domain.Ticket.TicketStatus;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.ticket.TicketDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketService {
    ApiResponse<Page<TicketDTO.Response>> getTickets(Long tenantId, TicketStatus status, String search, Pageable pageable);
    ApiResponse<TicketDTO.Response> getTicketById(Long id, Long tenantId);
    ApiResponse<TicketDTO.Response> updateTicketStatus(Long id, Long tenantId, TicketStatus newStatus);
    ApiResponse<TicketDTO.Response> createTicketAdmin(Long tenantId, TicketDTO.Request request);
    ApiResponse<Void> deleteTicket(Long id, Long tenantId);
}
