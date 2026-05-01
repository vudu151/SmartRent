package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.room.CreateRoomRequest;
import com.smartrent.dto.room.RoomInvoiceDTO;
import com.smartrent.dto.room.RoomResponse;
import com.smartrent.dto.room.UpdateRoomRequest;
import com.smartrent.service.RoomService;
import com.smartrent.annotation.LogAction;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Room/Apartment Management
 */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "APIs for managing rooms/apartments")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Get rooms", description = "Get paginated list of rooms with optional filters")
    public ResponseEntity<ApiResponse<Page<RoomResponse>>> getRooms(
            @RequestParam Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(roomService.getRooms(tenantId, status, type, floor, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get room by ID", description = "Get detailed information of a room")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(roomService.getRoomById(id, tenantId));
    }

    @PostMapping
    @Operation(summary = "Create room", description = "Create a new room")
    @LogAction(action = "CREATE", entityName = "Phòng trọ")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update room", description = "Update room information")
    @LogAction(action = "UPDATE", entityName = "Phòng trọ")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @Valid @RequestBody UpdateRoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete room", description = "Delete a room")
    @LogAction(action = "DELETE", entityName = "Phòng trọ")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(roomService.deleteRoom(id, tenantId));
    }

    @GetMapping("/floors")
    @Operation(summary = "Get floors", description = "Get list of distinct floors")
    public ResponseEntity<ApiResponse<List<Integer>>> getFloors(@RequestParam Long tenantId) {
        return ResponseEntity.ok(roomService.getFloors(tenantId));
    }

    @PatchMapping("/batch-status")
    @Operation(summary = "Batch update status", description = "Update status for multiple rooms")
    public ResponseEntity<ApiResponse<Void>> batchUpdateStatus(
            @RequestParam Long tenantId,
            @RequestParam List<Long> roomIds,
            @RequestParam String status) {
        return ResponseEntity.ok(roomService.batchUpdateStatus(tenantId, roomIds, status));
    }

    @GetMapping("/{id}/invoice")
    @Operation(summary = "Get room invoice", description = "Get invoice data for printing (includes meter readings, rent, services)")
    public ResponseEntity<ApiResponse<RoomInvoiceDTO>> getRoomInvoice(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(roomService.getRoomInvoice(id, tenantId, month, year));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get room timeline", description = "Get chronological events for a room")
    public ResponseEntity<ApiResponse<List<com.smartrent.dto.room.TimelineEventDTO>>> getRoomTimeline(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(roomService.getRoomTimeline(id, tenantId));
    }
}
