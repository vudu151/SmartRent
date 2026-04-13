package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.portal.PortalDTO;
import com.smartrent.service.PortalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@Tag(name = "Resident Portal", description = "Public-facing APIs for residents via magic links")
public class PortalController {

    private final PortalService portalService;

    @GetMapping("/contract/{token}")
    @Operation(summary = "Get portal details using magic link token")
    public ResponseEntity<ApiResponse<PortalDTO>> getPortalInfo(@PathVariable String token) {
        return ResponseEntity.ok(portalService.getPortalInfo(token));
    }

    @PostMapping("/contract/{token}/notify-payment")
    @Operation(summary = "Notify landlord that the resident has transferred the payment")
    public ResponseEntity<ApiResponse<Void>> notifyPayment(@PathVariable String token) {
        return ResponseEntity.ok(portalService.notifyPayment(token));
    }

    @GetMapping("/contract/{token}/tickets")
    @Operation(summary = "Get list of maintenance tickets for this resident")
    public ResponseEntity<ApiResponse<java.util.List<com.smartrent.dto.ticket.TicketDTO.Response>>> getPortalTickets(@PathVariable String token) {
        return ResponseEntity.ok(portalService.getPortalTickets(token));
    }

    @PostMapping("/contract/{token}/tickets")
    @Operation(summary = "Submit a new maintenance ticket from the resident portal")
    public ResponseEntity<ApiResponse<Void>> createPortalTicket(
            @PathVariable String token,
            @org.springframework.web.bind.annotation.RequestBody com.smartrent.dto.ticket.TicketDTO.Request request) {
        return ResponseEntity.ok(portalService.createPortalTicket(token, request));
    }

    @GetMapping("/contract/{token}/assets")
    @Operation(summary = "Get list of assets for this room via portal")
    public ResponseEntity<ApiResponse<java.util.List<com.smartrent.dto.asset.RoomAssetDTO.Response>>> getPortalAssets(@PathVariable String token) {
        return ResponseEntity.ok(portalService.getPortalAssets(token));
    }
}
