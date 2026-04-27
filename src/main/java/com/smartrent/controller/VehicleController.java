package com.smartrent.controller;

import com.smartrent.domain.VehicleType;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.vehicle.VehicleRequest;
import com.smartrent.dto.vehicle.VehicleResponse;
import com.smartrent.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Vehicle Management (Quản lý Xe)
 */
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicle Management", description = "APIs for managing vehicles (quản lý xe)")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Get vehicles", description = "Get paginated list of vehicles with filters")
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> getVehicles(
            @RequestParam Long buildingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) Long roomId) {
        Page<VehicleResponse> vehicles = vehicleService.getVehicles(buildingId, page, size, search, vehicleType, roomId);
        return ResponseEntity.ok(ApiResponse.success(vehicles, "Lấy danh sách xe thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID", description = "Get detailed information of a vehicle")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success(vehicle, "Lấy thông tin xe thành công"));
    }

    @PostMapping
    @Operation(summary = "Create vehicle", description = "Register a new vehicle for a resident")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
            @Valid @RequestBody VehicleRequest request,
            @RequestParam Long buildingId) {
        VehicleResponse vehicle = vehicleService.createVehicle(request, buildingId);
        return ResponseEntity.ok(ApiResponse.success(vehicle, "Thêm xe thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle", description = "Update vehicle information")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success(vehicle, "Cập nhật xe thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete vehicle", description = "Remove a vehicle registration")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa xe thành công"));
    }
}
