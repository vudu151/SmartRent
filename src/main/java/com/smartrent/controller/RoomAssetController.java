package com.smartrent.controller;

import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.asset.RoomAssetDTO;
import com.smartrent.service.RoomAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Tag(name = "Room Assets", description = "Admin APIs for managing inventory and assets inside rooms")
public class RoomAssetController {

    private final RoomAssetService roomAssetService;

    @GetMapping
    @Operation(summary = "Get all assets for a specific room")
    public ResponseEntity<ApiResponse<List<RoomAssetDTO.Response>>> getAssetsByRoom(
            @RequestParam Long roomId,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(roomAssetService.getAssetsByRoom(roomId, tenantId));
    }

    @PostMapping
    @Operation(summary = "Add a new asset to a room")
    public ResponseEntity<ApiResponse<RoomAssetDTO.Response>> createAsset(
            @RequestParam Long tenantId,
            @Valid @RequestBody RoomAssetDTO.Request request) {
        return ResponseEntity.ok(roomAssetService.createAsset(tenantId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update asset details or condition")
    public ResponseEntity<ApiResponse<RoomAssetDTO.Response>> updateAsset(
            @PathVariable Long id,
            @RequestParam Long tenantId,
            @Valid @RequestBody RoomAssetDTO.Request request) {
        return ResponseEntity.ok(roomAssetService.updateAsset(id, tenantId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove asset from a room")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(
            @PathVariable Long id,
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(roomAssetService.deleteAsset(id, tenantId));
    }
}
