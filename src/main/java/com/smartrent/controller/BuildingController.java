package com.smartrent.controller;

import com.smartrent.domain.Building;
import com.smartrent.dto.ApiResponse;
import com.smartrent.dto.service.BuildingDTO;
import com.smartrent.exception.ResourceNotFoundException;
import com.smartrent.repository.BuildingRepository;
import com.smartrent.repository.TenantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@Tag(name = "Building Management")
public class BuildingController {

    private final BuildingRepository buildingRepository;
    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "Get all buildings for a tenant")
    public ResponseEntity<ApiResponse<List<BuildingDTO>>> getBuildings(@RequestParam Long tenantId) {
        List<BuildingDTO> dtos = buildingRepository.findByTenantId(tenantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Thành công"));
    }

    @PostMapping
    @Operation(summary = "Create a new building")
    public ResponseEntity<ApiResponse<BuildingDTO>> createBuilding(
            @RequestParam Long tenantId,
            @RequestBody BuildingDTO request) {
        Building b = new Building();
        b.setTenant(tenantRepository.findById(tenantId).orElseThrow());
        b.setName(request.getName());
        b.setAddress(request.getAddress());
        b.setElectricityPrice(request.getElectricityPrice());
        b.setWaterPrice(request.getWaterPrice());
        b.setServicePrice(request.getServicePrice());
        b.setInternetPrice(request.getInternetPrice());
        b.setParkingPrice(request.getParkingPrice());
        
        b = buildingRepository.save(b);
        return ResponseEntity.ok(ApiResponse.success(toDTO(b), "Tạo thành công"));
    }

    private BuildingDTO toDTO(Building b) {
        return BuildingDTO.builder()
                .id(b.getId())
                .tenantId(b.getTenant().getId())
                .name(b.getName())
                .address(b.getAddress())
                .servicePrice(b.getServicePrice())
                .parkingPrice(b.getParkingPrice())
                .waterPrice(b.getWaterPrice())
                .electricityPrice(b.getElectricityPrice())
                .internetPrice(b.getInternetPrice())
                .build();
    }
}
