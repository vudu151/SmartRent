package com.smartrent.controller;

import com.smartrent.domain.Ticket.TicketStatus;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.ticket.TicketDTO;
import com.smartrent.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Admin APIs for managing maintenance and incident tickets")
public class TicketController {

    private final TicketService ticketService;


    @GetMapping
    @Operation(summary = "Get paginated and filtered tickets")
    public ResponseEntity<ApiResponse<Page<TicketDTO.Response>>> getTickets(
            @RequestParam Long tenantId,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ticketService.getTickets(tenantId, status, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single ticket details")
    public ResponseEntity<ApiResponse<TicketDTO.Response>> getTicketById(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ticketService.getTicketById(id, tenantId));
    }

    @PostMapping
    @Operation(summary = "Create ticket manually by Admin")
    public ResponseEntity<ApiResponse<TicketDTO.Response>> createTicket(
            @RequestParam Long tenantId,
            @Valid @RequestBody TicketDTO.Request request) {
        return ResponseEntity.ok(ticketService.createTicketAdmin(tenantId, request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update ticket status (e.g. from PENDING to IN_PROGRESS)")
    public ResponseEntity<ApiResponse<TicketDTO.Response>> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, tenantId, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ticket")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ticketService.deleteTicket(id, tenantId));
    }
}
